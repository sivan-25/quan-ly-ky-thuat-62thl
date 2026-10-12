/*
 * ESTA seamless photo capture. Direct camera captures a frame to the image
 * annotator with NO native OS "Use Photo" confirmation. getUserMedia can
 * trigger a camera permission prompt on the user's first tap; JavaScript
 * cannot bypass that OS/browser requirement. No camera opens on app launch.
 */
(() => {
  "use strict";
  let status = "unknown";
  let livePermission = null;
  let sequence = 0;
  let deniedThisSession = false;

  const isIOS = () => {
    const ua = navigator.userAgent || "";
    return /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  };

  // Use in-app camera on iPhone/Android when possible. Only this mode
  // bypasses the native camera's mandatory "Sử dụng ảnh" confirmation.
  // A user click starts getUserMedia; do not request a stream on page load.
  const canUseDirect = () =>
    !deniedThisSession && status !== "denied" &&
    !!navigator.mediaDevices?.getUserMedia;

  const reportFailure = error => {
    if (["NotAllowedError", "PermissionDeniedError", "SecurityError"].includes(error?.name)) {
      deniedThisSession = true;
      status = "denied";
    }
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
      if (status === "granted") deniedThisSession = false;
      p.onchange = () => {
        status = p.state || "unknown";
        if (status === "granted") deniedThisSession = false;
      };
    } catch (_) {
      if (current === sequence) status = "unsupported";
    }
    return status;
  }

  window.ESTACameraPolicy = Object.freeze({
    canUseDirect,
    reportFailure,
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
