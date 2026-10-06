const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = path.resolve(__dirname, "..");

function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}

function loadProjectConfig() {
  const context = {
    window: {},
    Object,
    String,
  };
  vm.createContext(context);
  vm.runInContext(read("project-config.js"), context, { filename: "project-config.js" });
  return context.window;
}

(function testNew10Config() {
  const win = loadProjectConfig();
  const cfg = win.estaProjectConfig("NEW10");
  assert.equal(cfg.sourceProject, "127HH");
  assert.equal(cfg.singleTaskResult, true);
  assert.equal(cfg.compactPeople, true);
  assert.equal(cfg.electricMeters, 1);
  assert.equal(cfg.supportsSolar, false);
  assert.equal(cfg.supportsXlnt, false);
})();

(function testUnknownProjectGetsSafeDefaults() {
  const win = loadProjectConfig();
  const cfg = win.estaProjectConfig("SOME-FUTURE-PROJECT");
  assert.equal(cfg.sourceProject, null);
  assert.equal(cfg.singleTaskResult, false);
  assert.equal(cfg.electricMeters, 1);
  assert.equal(cfg.supportsSolar, true);
  assert.equal(cfg.supportsXlnt, false);
})();

(function testConfigLoadsBeforeApp() {
  const html = read("index.html");
  const configIndex = html.indexOf("project-config.js");
  const storeIndex = html.indexOf("project-store.js");
  const appIndex = html.indexOf("app.js");
  const pilotIndex = html.indexOf("new10-pilot.js");
  assert.ok(configIndex >= 0, "project-config.js must be loaded");
  assert.ok(storeIndex > configIndex, "project-store.js must load after project-config.js");
  assert.ok(appIndex > storeIndex, "project-store.js must load before app.js");
  assert.ok(pilotIndex > appIndex, "new10-pilot.js must load after app.js");
})();

(function testAppUsesFeatureConfigWithoutNew10Hardcode() {
  const app = read("app.js");
  assert.ok(app.includes("function projectFeature("));
  assert.ok(app.includes('projectFeature("singleTaskResult"'));
  assert.ok(app.includes('projectFeature("compactPeople"'));
  assert.ok(app.includes('projectFeature("supportsSolar"'));
  assert.ok(app.includes('projectFeature("supportsXlnt"'));
  assert.ok(app.includes('projectFeature("electricMeters"'));
  assert.ok(!app.includes('"NEW10"'), "NEW10 behavior belongs in project-config.js, not app.js");
})();

(function testPilotStylesAreScoped() {
  const css = read("new10-pilot.css");
  assert.ok(css.includes("#app.new10Pilot"));
  assert.ok(css.includes("html.new10PilotPage"));
  assert.ok(!css.includes("#app:not(.new10Pilot)"));
})();

console.log("NEW10 project config regression: OK");


(function testProjectStoreIsPilotScoped() {
  const store = read("project-store.js");
  assert.ok(store.includes('const PILOT_ID = "NEW10"'));
  assert.ok(store.includes('esta:new10:task-draft:v1'));
  assert.ok(store.includes("writeTasks"));
  assert.ok(store.includes("writeEnergy"));
  assert.ok(store.includes("setStatus"));
})();

(function testAdminOverviewExcludesSandbox() {
  const source = read("supabase/functions/admin-overview/index.ts");
  assert.ok(source.includes('new Set(["NEW10"])'));
  assert.ok(source.includes("liveBuildings"));
})();
