import { test, expect } from "@playwright/test";

async function activateNew10(page) {
  await page.goto("/");
  await page.waitForFunction(() => !!window.ESTA_NEW10_PILOT && !!window.estaProjectConfig);

  await page.evaluate(() => {
    currentBuilding = { id: "NEW10", name: "new 1.0", role: "admin" };
    projectOverviewActive = true;
    document.querySelector("#login")?.classList.add("hide");
    document.querySelector("#app")?.classList.remove("hide");
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
    supportsXlnt: false
  });

  await expect(page.locator("html")).toHaveClass(/new10PilotPage/);
});

test("NEW10 mobile filter stays inside viewport and persists", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only pilot assertion");
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
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only pilot assertion");
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
