/* Progressive installation only. Never refresh an open task form automatically. */
(() => {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", {scope: "/", updateViaCache: "none"})
      .then(reg => {
        // Fetch updated static assets on subsequent launches, without forcing a reload.
        window.addEventListener("pageshow", () => { if (navigator.onLine) reg.update().catch(() => {}); });
      })
      .catch(error => console.warn("ESTA PWA unavailable:", error));
  }, {once: true});
})();
