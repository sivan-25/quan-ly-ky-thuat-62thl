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

  function syncBadgeLabel(status) {
    if (!navigator.onLine) return { text: "Ngoại tuyến", state: "offline" };
    const state = status?.state || "idle";
    if (state === "syncing") return { text: "Đang đồng bộ…", state };
    if (state === "error") return { text: "Chưa đồng bộ", state };
    if (state === "queued") return { text: status?.detail ? "Chờ đồng bộ · " + status.detail : "Chờ đồng bộ", state };
    if (state === "synced") return { text: "Đã đồng bộ", state };
    return { text: "Cloud sẵn sàng", state: "idle" };
  }

  function ensureSyncBadge() {
    let badge = document.getElementById("new10SyncStatus");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "new10SyncStatus";
      badge.className = "new10SyncStatus";
      badge.setAttribute("role", "status");
      badge.setAttribute("aria-live", "polite");
      document.body.appendChild(badge);
    }
    const on = isPilot();
    badge.classList.toggle("hide", !on);
    if (!on) return badge;
    const status = window.ESTA_PROJECT_STORE?.getStatus?.() || { state: "idle" };
    const view = syncBadgeLabel(status);
    badge.dataset.state = view.state;
    badge.textContent = view.text;
    badge.title = status?.detail ? view.text + " · " + status.detail : view.text;
    return badge;
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
    ensureSyncBadge();

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

  function decorateAdminProjectCard() {
    if (typeof adminProjectCard !== "function" || adminProjectCard.__new10Wrapped) return;
    const original = adminProjectCard;
    const wrapped = function(building, index = 0) {
      let html = original(building, index);
      if (String(building?.id || "") === PILOT_ID && !html.includes("new10ProjectBadge")) {
        html = html.replace("</h3>", ' <span class="new10ProjectBadge">PILOT 1.0</span></h3>');
      }
      return html;
    };
    wrapped.__new10Wrapped = true;
    adminProjectCard = wrapped;
  }

  function boot() {
    decorateAdminProjectCard();
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
    window.addEventListener("online", ensureSyncBadge);
    window.addEventListener("offline", ensureSyncBadge);
    window.addEventListener("esta:new10:sync-status", ensureSyncBadge);
    window.addEventListener("pageshow", () => {
      bindFilters();
      syncPilotScope();
      ensureSyncBadge();
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