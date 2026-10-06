(() => {
  "use strict";

  const PILOT_ID = "NEW10";
  const FILTER_KEY = "esta:new10:work-filter:v1";
  const FILTER_IDS = ["search", "globalSearch", "quickRange", "filterType", "filterStatus", "fromDate", "toDate"];
  let wasPilot = false;
  let restoring = false;

  function isPilot() {
    try {
      return String(currentBuilding?.id || "") === PILOT_ID && !!projectOverviewActive;
    } catch (_) {
      return false;
    }
  }

  function appNode() {
    return document.getElementById("app");
  }

  function readFilterState() {
    const state = {};
    for (const id of FILTER_IDS) {
      const el = document.getElementById(id);
      if (el) state[id] = el.value || "";
    }
    try {
      if (typeof workStatFilter !== "undefined") state.workStatFilter = workStatFilter || "";
    } catch (_) {}
    return state;
  }

  function saveFilterState() {
    if (!isPilot() || restoring) return;
    try {
      localStorage.setItem(FILTER_KEY, JSON.stringify(readFilterState()));
    } catch (_) {}
  }

  function restoreFilterState() {
    if (!isPilot()) return;
    let state = null;
    try {
      state = JSON.parse(localStorage.getItem(FILTER_KEY) || "null");
    } catch (_) {}
    if (!state || typeof state !== "object") return;

    restoring = true;
    try {
      for (const id of FILTER_IDS) {
        const el = document.getElementById(id);
        if (el && Object.prototype.hasOwnProperty.call(state, id)) {
          el.value = state[id] || "";
        }
      }
      try {
        if (typeof workStatFilter !== "undefined") {
          workStatFilter = state.workStatFilter || "";
        }
      } catch (_) {}
      try {
        if (typeof render === "function") render();
      } catch (_) {}
    } finally {
      restoring = false;
    }
  }

  function syncPilotScope() {
    const on = isPilot();
    appNode()?.classList.toggle("new10Pilot", on);
    document.documentElement.classList.toggle("new10PilotPage", on);

    if (on && !wasPilot) {
      setTimeout(restoreFilterState, 0);
      setTimeout(restoreFilterState, 180);
    }
    wasPilot = on;
  }

  function bindFilters() {
    for (const id of FILTER_IDS) {
      const el = document.getElementById(id);
      if (!el || el.dataset.new10PilotBound === "1") continue;
      el.dataset.new10PilotBound = "1";
      el.addEventListener("input", () => setTimeout(saveFilterState, 0));
      el.addEventListener("change", () => setTimeout(saveFilterState, 0));
    }

    const clear = document.getElementById("clear");
    if (clear && clear.dataset.new10PilotBound !== "1") {
      clear.dataset.new10PilotBound = "1";
      clear.addEventListener("click", () => setTimeout(saveFilterState, 0));
    }

    document.querySelectorAll("[data-work-stat-filter]").forEach((el) => {
      if (el.dataset.new10PilotBound === "1") return;
      el.dataset.new10PilotBound = "1";
      el.addEventListener("click", () => setTimeout(saveFilterState, 0));
    });
  }

  function boot() {
    bindFilters();
    syncPilotScope();

    const app = appNode();
    if (app) {
      new MutationObserver(() => {
        bindFilters();
        syncPilotScope();
      }).observe(app, { attributes: true, attributeFilter: ["class"] });
    }

    const technicalSelect = document.getElementById("technicalProjectSelect");
    technicalSelect?.addEventListener("change", () => {
      setTimeout(syncPilotScope, 0);
      setTimeout(syncPilotScope, 200);
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".adminProjectOpen,.homeProjectCard,[data-project-id]")) {
        setTimeout(syncPilotScope, 0);
        setTimeout(syncPilotScope, 250);
      }
    }, true);

    window.addEventListener("focus", syncPilotScope);
    window.addEventListener("pageshow", () => {
      bindFilters();
      syncPilotScope();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.ESTA_NEW10_PILOT = Object.freeze({
    id: PILOT_ID,
    version: "1.0",
    sourceProject: "127HH",
    features: Object.freeze({
      isolatedResponsiveLayer: true,
      persistentWorkFilters: true,
      sharedProductionProjectsUntouched: true
    }),
    verify: Object.freeze({
      syncScope: syncPilotScope,
      saveFilters: saveFilterState,
      restoreFilters: restoreFilterState
    })
  });
})();