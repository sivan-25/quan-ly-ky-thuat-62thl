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
