import { test, expect } from "@playwright/test";

async function activateNew10(page) {
  await page.goto("/");
  await page.waitForFunction(() => !!window.ESTA_NEW10_PILOT && !!window.estaProjectConfig);

  await page.evaluate(() => {
    currentAccount = {
      is_admin: true,
      display_name: "NEW10 QA Admin",
      buildings: [{ id: "NEW10", name: "new 1.0", role: "editor" }]
    };
    currentBuilding = { id: "NEW10", name: "new 1.0", role: "editor" };
    projectOverviewActive = true;
    document.querySelector("#login")?.classList.add("hide");
    document.querySelector("#app")?.classList.remove("hide");
    if (typeof applyBuildingUI === "function") applyBuildingUI();
    window.ESTA_NEW10_PILOT.verify.syncScope();
  });

  await expect(page.locator("#app")).toHaveClass(/new10Pilot/);
}

test("NEW10 uses 127HH pilot configuration", async ({ page }) => {
  await activateNew10(page);

  const config = await page.evaluate(() => window.estaProjectConfig("NEW10"));
  expect(config).toMatchObject({
    sourceProject: "127HH",
    singleTaskResult: true,
    compactPeople: true,
    electricMeters: 1,
    supportsSolar: false,
    supportsXlnt: false,
    sandbox: true,
    adminOnly: true
  });

  await expect(page.locator("html")).toHaveClass(/new10PilotPage/);
});

test("NEW10 mobile filter stays inside viewport and persists", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile-"), "Mobile-only pilot assertion");
  await activateNew10(page);

  await page.evaluate(() => {
    const values = {
      filterType: "Sự cố",
      filterStatus: "Đang thực hiện",
      fromDate: "2026-10-01",
      toDate: "2026-10-31"
    };
    for (const [id, value] of Object.entries(values)) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.value = value;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const bar = document.getElementById("filterBar");
    bar?.classList.remove("hide");
    window.ESTA_NEW10_PILOT.verify.saveFilters();
  });

  const filterBox = page.locator("#filterBar");
  await expect(filterBox).toBeVisible();

  const box = await filterBox.boundingBox();
  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width + 1);

  const persisted = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("esta:new10:work-filter:v1") || "{}")
  );
  expect(persisted).toMatchObject({
    filterType: "Sự cố",
    filterStatus: "Đang thực hiện",
    fromDate: "2026-10-01",
    toDate: "2026-10-31"
  });

  await page.evaluate(() => {
    for (const id of ["filterType", "filterStatus", "fromDate", "toDate"]) {
      const el = document.getElementById(id);
      if (el) el.value = "";
    }
    window.ESTA_NEW10_PILOT.verify.restoreFilters();
  });

  await expect(page.locator("#filterType")).toHaveValue("Sự cố");
  await expect(page.locator("#filterStatus")).toHaveValue("Đang thực hiện");
  await expect(page.locator("#fromDate")).toHaveValue("2026-10-01");
  await expect(page.locator("#toDate")).toHaveValue("2026-10-31");
});

test("NEW10 mobile editor keeps Save and Cancel on one sticky row", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile-"), "Mobile-only pilot assertion");
  await activateNew10(page);

  await page.evaluate(() => {
    const drawer = document.getElementById("workEditDrawer");
    drawer?.classList.remove("hide");
    document.body.classList.add("workEditOpen");
    const mount = document.getElementById("workEditDrawerMount");
    const card = document.querySelector("#workPage .workEntryCard");
    if (mount && card && card.parentElement !== mount) mount.appendChild(card);
  });

  const actions = page.locator("#workEditDrawerMount #taskForm .workFormActions");
  await expect(actions).toBeVisible();

  const styles = await actions.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      position: s.position,
      display: s.display,
      flexDirection: s.flexDirection,
      flexWrap: s.flexWrap
    };
  });
  expect(styles.position).toBe("sticky");
  expect(styles.display).toBe("flex");
  expect(styles.flexDirection).toBe("row");
  expect(styles.flexWrap).toBe("nowrap");

  const cancel = page.locator("#workEditDrawerMount #cancelEdit");
  const save = page.locator("#workEditDrawerMount #saveBtn");
  const [c, s] = await Promise.all([cancel.boundingBox(), save.boundingBox()]);
  expect(c).not.toBeNull();
  expect(s).not.toBeNull();
  expect(Math.abs(c.y - s.y)).toBeLessThan(4);
});


test("NEW10 store isolates draft and exposes sync status", async ({ page }) => {
  await activateNew10(page);

  await page.evaluate(() => {
    window.ESTA_PROJECT_STORE.writeDraft({
      d: "2026-10-06",
      c: "NEW10 draft only",
      t: "Hằng ngày",
      s: "Đang thực hiện",
      a: "",
      n: ""
    });
    window.ESTA_PROJECT_STORE.setStatus("syncing", "e2e");
  });

  const draft = await page.evaluate(() => window.ESTA_PROJECT_STORE.readDraft());
  expect(draft.c).toBe("NEW10 draft only");
  expect(await page.evaluate(() => localStorage.getItem("qlkt62_draft"))).toBeNull();

  const badge = page.locator("#new10SyncStatus");
  await expect(badge).toBeVisible();
  await expect(badge).toContainText("Đang đồng bộ");

  await page.evaluate(() => window.ESTA_PROJECT_STORE.setStatus("synced", "e2e"));
  await expect(badge).toContainText("Đã đồng bộ");
});

test("NEW10 energy capabilities match 127HH", async ({ page }) => {
  await activateNew10(page);

  await page.evaluate(() => {
    if (typeof showModule === "function") showModule("energy");
    if (typeof sync68EnergyTabs === "function") sync68EnergyTabs();
  });

  const config = await page.evaluate(() => window.estaProjectConfig("NEW10"));
  expect(config.electricMeters).toBe(1);
  expect(config.supportsSolar).toBe(false);
  expect(config.supportsXlnt).toBe(false);

  await expect(page.locator('[data-energy-type="solar"]')).toBeHidden();
  await expect(page.locator('[data-energy-type="xlnt"]')).toBeHidden();
  await expect(page.locator("#energyValue2Field")).toBeHidden();
});

test("NEW10 primary modules have no page-level horizontal overflow on mobile", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile-"), "Mobile-only pilot assertion");
  await activateNew10(page);

  for (const name of ["work", "energy", "inventory", "maintenance", "contractor", "construction", "incident", "inspection", "documents", "reports"]) {
    await page.evaluate((moduleName) => {
      if (typeof showModule === "function") showModule(moduleName);
    }, name);
    await page.waitForTimeout(80);

    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      bodyScrollWidth: document.body.scrollWidth,
      docScrollWidth: document.documentElement.scrollWidth
    }));
    expect(metrics.bodyScrollWidth, name + " body overflow").toBeLessThanOrEqual(metrics.innerWidth + 2);
    expect(metrics.docScrollWidth, name + " document overflow").toBeLessThanOrEqual(metrics.innerWidth + 2);
  }
});

test("NEW10 work toolbar keeps Filter and PDF available", async ({ page }) => {
  await activateNew10(page);
  await page.evaluate(() => {
    if (typeof showModule === "function") showModule("work");
  });

  await expect(page.locator("#toggleFilter")).toBeVisible();
  await expect(page.locator("#exportBtn")).toBeVisible();
  await expect(page.locator("#toggleFilter")).toBeEnabled();
  await expect(page.locator("#exportBtn")).toBeEnabled();
});


test("NEW10 advanced operation modules are enabled", async ({ page }) => {
  await activateNew10(page);

  for (const pair of [
    ["incident", "#incidentPage", "#navIncident"],
    ["inspection", "#inspectionPage", "#navInspection"],
    ["documents", "#documentsPage", "#navDocuments"],
    ["reports", "#reportsPage", "#navReports"]
  ]) {
    const [moduleName, pageSelector, navSelector] = pair;
    await page.evaluate((name) => showModule(name), moduleName);
    await expect(page.locator(pageSelector)).toBeVisible();
    await expect(page.locator(navSelector)).toBeVisible();
  }
});

test("NEW10 module navigation has no uncaught page errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error?.message || error)));
  await activateNew10(page);

  for (const name of ["work", "energy", "inventory", "maintenance", "contractor", "construction", "incident", "inspection", "documents", "reports"]) {
    await page.evaluate((moduleName) => showModule(moduleName), name);
    await page.waitForTimeout(50);
  }

  expect(errors).toEqual([]);
});


test("NEW10 shared validation covers core forms", async ({ page }) => {
  await activateNew10(page);
  const out=await page.evaluate(()=>{
    const invalid=window.ESTA_VALIDATION.validate("task",{date:"bad",content:"",performers:[],note:"",requiresCompletionNote:false});
    const valid=window.ESTA_VALIDATION.validate("task",{date:"2026-10-06",content:"Kiểm tra máy lạnh",performers:["QA"],note:"",requiresCompletionNote:false});
    const material=window.ESTA_VALIDATION.validate("material",{name:"Lọc gió",unit:"Cái",trackingStart:"2026-10-06",openingQty:2,minQty:1,today:"2026-10-06"});
    return {invalid:invalid.ok,valid:valid.ok,material:material.ok,count:invalid.issues.length};
  });
  expect(out.invalid).toBe(false);
  expect(out.valid).toBe(true);
  expect(out.material).toBe(true);
  expect(out.count).toBeGreaterThan(0);
});

test("NEW10 UI Core decorates forms and tables", async ({ page }) => {
  await activateNew10(page);
  await page.evaluate(()=>window.ESTA_UI_CORE?.decorate?.());
  await page.waitForTimeout(100);
  await expect(page.locator("#app")).toHaveClass(/estaCoreV2/);
  await expect(page.locator("#taskForm")).toHaveClass(/estaFormCore/);
  await page.evaluate(()=>showModule("work"));
  const table=page.locator("#workPage table").first();
  if(await table.count()) await expect(table).toHaveClass(/estaDataTableCore/);
});

test("NEW10 offline project sync queues and flushes safely", async ({ page }) => {
  await activateNew10(page);
  await page.evaluate(()=>{
    centralSession={access_token:"qa-token",expires_at:4102444800};
    localStorage.removeItem("esta:new10:sync-queue:v2");
  });
  await page.context().setOffline(true);
  const queued=await page.evaluate(async()=>{
    const r=await projectSync("upsert_task",{item:{id:987654,c:"Offline QA"}},"NEW10");
    return {r,count:window.ESTA_SYNC_QUEUE.count()};
  });
  expect(queued.r.queued).toBe(true);
  expect(queued.count).toBe(1);
  await expect(page.locator("#new10SyncStatus")).toContainText("Chờ đồng bộ");

  await page.context().setOffline(false);
  const flushed=await page.evaluate(async()=>{
    window.ESTA_SYNC_QUEUE.configure(async()=>({updated_at:new Date().toISOString()}));
    const r=await window.ESTA_SYNC_QUEUE.flush();
    return {r,count:window.ESTA_SYNC_QUEUE.count()};
  });
  expect(flushed.count).toBe(0);
});

test("NEW10 media manager persists image while offline", async ({ page }) => {
  await activateNew10(page);
  await page.evaluate(()=>{centralSession={access_token:"qa-token",expires_at:4102444800}});
  await page.context().setOffline(true);
  const count=await page.evaluate(async()=>{
    const canvas=document.createElement("canvas");canvas.width=8;canvas.height=8;
    const blob=await new Promise(r=>canvas.toBlob(r,"image/jpeg",.7));
    const file=new File([blob],"camera-qa.jpg",{type:"image/jpeg"});
    const out=await window.ESTA_MEDIA_MANAGER.energyFile(file,"991",0,"NEW10");
    return {queued:out.queued,count:await window.ESTA_MEDIA_MANAGER.count()};
  });
  expect(count.queued).toBe(true);
  expect(count.count).toBeGreaterThan(0);
  await page.context().setOffline(false);
});

test("NEW10 versioned PDF archive builds storage metadata without production write", async ({ page }) => {
  await activateNew10(page);
  const result=await page.evaluate(async()=>{
    centralSession={access_token:"qa-token",expires_at:4102444800};
    const originalSb=window.sbFetch,originalAuth=window.centralAuthFetch;
    window.sbFetch=async(path,options={})=>{
      if(path.includes("select=version"))return [{version:2}];
      if(path.includes("/rest/v1/report_registry")&&String(options.method||"GET").toUpperCase()==="POST")return [];
      return [];
    };
    window.centralAuthFetch=async()=>new Response("{}",{status:200,headers:{"Content-Type":"application/json"}});
    try{
      const blob=new Blob(["%PDF-1.4\n% QA"],{type:"application/pdf"});
      const r=await window.ESTA_REPORT_ARCHIVE.archivePdf({
        blob,buildingId:"NEW10",filename:"qa-report.pdf",reportType:"Vận hành kỹ thuật",
        periodLabel:"QA",periodFrom:"2026-10-01",periodTo:"2026-10-31",createdBy:null
      });
      return {version:r.version,fileRef:r.fileRef,checksum:r.record.checksum,size:r.record.file_size};
    }finally{
      window.sbFetch=originalSb;window.centralAuthFetch=originalAuth;
    }
  });
  expect(result.version).toBe(3);
  expect(result.fileRef).toContain("storage:report-files:");
  expect(result.checksum.length).toBe(64);
  expect(result.size).toBeGreaterThan(0);
});

test("NEW10 report capability config hides unsupported solar", async ({ page }) => {
  await activateNew10(page);
  const cfg=await page.evaluate(()=>window.estaProjectConfig("NEW10"));
  expect(cfg.supportsSolar).toBe(false);
  expect(cfg.supportsXlnt).toBe(false);
  await page.evaluate(()=>showModule("reports"));
  await expect(page.locator("#reportsPage")).toBeVisible();
});
