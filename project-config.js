(() => {
  "use strict";

  const DEFAULT = Object.freeze({
    sourceProject: null,
    singleTaskResult: false,
    compactPeople: false,
    electricMeters: 1,
    supportsSolar: true,
    supportsXlnt: false
  });

  const PROJECTS = Object.freeze({
    NEW10: Object.freeze({
      sourceProject: "127HH",
      singleTaskResult: true,
      compactPeople: true,
      electricMeters: 1,
      supportsSolar: false,
      supportsXlnt: false
    })
  });

  window.ESTA_PROJECT_CONFIG = Object.freeze({ DEFAULT, PROJECTS });
  window.estaProjectConfig = (id) => {
    const key = String(id || "").trim();
    return Object.freeze({ ...DEFAULT, ...(PROJECTS[key] || {}) });
  };
})();