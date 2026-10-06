(() => {
  "use strict";

  const PILOT_ID = "NEW10";
  const STATUS_KEY = "esta:new10:sync-status:v1";
  const DRAFT_KEY = "esta:new10:task-draft:v1";
  const listeners = new Set();

  const legacyTaskKey = (id) => id === "62THL" ? "qlkt62_v1" : "qlkt_tasks_" + id;
  const legacyEnergyKey = (id) => id === "62THL" ? "qlkt62_energy_v1" : "qlkt_energy_" + id;

  function safeReadList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  }

  function safeWriteList(key, value) {
    const list = Array.isArray(value) ? value : [];
    localStorage.setItem(key, JSON.stringify(list));
    return list;
  }

  function currentId() {
    try { return String(currentBuilding?.id || ""); }
    catch (_) { return ""; }
  }

  function isPilot(id = currentId()) {
    return String(id || "") === PILOT_ID;
  }

  function emit(status) {
    listeners.forEach((fn) => {
      try { fn(status); } catch (_) {}
    });
    try {
      window.dispatchEvent(new CustomEvent("esta:new10:sync-status", { detail: status }));
    } catch (_) {}
  }

  function setStatus(state, detail = "") {
    if (!isPilot()) return;
    const value = {
      state,
      detail: String(detail || ""),
      at: new Date().toISOString()
    };
    try { sessionStorage.setItem(STATUS_KEY, JSON.stringify(value)); } catch (_) {}
    emit(value);
  }

  function getStatus() {
    try {
      const value = JSON.parse(sessionStorage.getItem(STATUS_KEY) || "null");
      return value && typeof value === "object" ? value : { state: "idle", detail: "", at: null };
    } catch (_) {
      return { state: "idle", detail: "", at: null };
    }
  }

  const api = {
    id: PILOT_ID,
    isPilot,
    taskKey: legacyTaskKey,
    energyKey: legacyEnergyKey,
    readTasks(id = currentId()) {
      return safeReadList(legacyTaskKey(id));
    },
    writeTasks(value, id = currentId()) {
      return safeWriteList(legacyTaskKey(id), value);
    },
    readEnergy(id = currentId()) {
      return safeReadList(legacyEnergyKey(id));
    },
    writeEnergy(value, id = currentId()) {
      return safeWriteList(legacyEnergyKey(id), value);
    },
    readDraft() {
      if (!isPilot()) return null;
      try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); }
      catch (_) { return null; }
    },
    writeDraft(value) {
      if (!isPilot()) return;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(value || null));
    },
    clearDraft() {
      if (!isPilot()) return;
      localStorage.removeItem(DRAFT_KEY);
    },
    setStatus,
    getStatus,
    subscribe(fn) {
      if (typeof fn !== "function") return () => {};
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };

  window.ESTA_PROJECT_STORE = Object.freeze(api);
})();