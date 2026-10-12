/*
 * ESTA camera permissions: never trigger a new getUserMedia permission prompt
 * during a routine "Chụp hình" action. Use system camera unless direct capture
 * is already permitted. This code NEVER requests camera permission itself.
 */
(() => {
  "use strict";
  let status = "unknown";
  let livePermission = null;
  let sequence = 0;

  const isIOS = () => {
    const ua = navigator.userAgent || "";
    return /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  };

  // In installed Safari PWAs, native capture is more predictable than
  // getUserMedia; the browser/OS controls its own permission prompts.
  const canUseDirect = () => {
    return !isIOS() &&
      status === "granted" &&
      !!navigator.mediaDevices?.getUserMedia;
  };

  async function refresh() {
    const current = ++sequence;
    if (isIOS() || !navigator.permissions?.query || !navigator.mediaDevices?.getUserMedia) {
      status = "unsupported";
      return status;
    }
    try {
      const p = await navigator.permissions.query({name: "camera"});
      if (current !== sequence) return status;
      if (livePermission && livePermission !== p) livePermission.onchange = null;
      livePermission = p;
      status = p.state || "unknown";
      p.onchange = () => { status = p.state || "unknown"; };
    } catch (_) {
      if (current === sequence) status = "unsupported";
    }
    return status;
  }

  window.ESTACameraPolicy = Object.freeze({
    canUseDirect,
    refresh,
    get state() { return status; }
  });

  // Permission query is non-prompting, and runs outside user gestures.
  refresh();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });
  window.addEventListener("focus", () => { refresh(); });
})();
