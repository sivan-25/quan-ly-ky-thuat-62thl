/* ESTA PWA: detect production releases while an installed app stays open.
   Never refresh a form with unsaved input, photos or a visible edit dialog. */
(() => {
  'use strict';
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;

  const VERSION_URL = '/api/app-version';
  const VERSION_KEY = 'esta.pwa.last-production-version';
  const POLL_MS = 90000;
  const IDLE_MS = 8000;
  let lastKnown = null;
  try { lastKnown = localStorage.getItem(VERSION_KEY); } catch (_) { /* Private mode. */ }
  let pending = null;
  let checking = false;
  let refreshing = false;
  let draftTouched = false;
  let lastInteraction = Date.now();
  let workerRegistration = null;
  let updateNotice = null;

  function remember(version) {
    lastKnown = version;
    try { localStorage.setItem(VERSION_KEY, version); } catch (_) { /* Private mode. */ }
  }

  function isDisplayed(element) {
    return Boolean(element && element.getClientRects().length &&
      window.getComputedStyle(element).visibility !== 'hidden');
  }

  function hasUnsavedWork() {
    if (draftTouched) return true;
    const active = document.activeElement;
    if (active && isDisplayed(active) && active.matches &&
        active.matches('textarea, input:not([type="hidden"]):not([type="button"]), [contenteditable="true"]')) return true;
    if (document.querySelector('input[type="file"]:not([disabled])') &&
        [...document.querySelectorAll('input[type="file"]')].some(input => input.files && input.files.length)) return true;
    return [...document.querySelectorAll('[role="dialog"][aria-modal="true"], dialog[open]')].some(isDisplayed);
  }

  function hideNotice() {
    if (updateNotice) updateNotice.remove();
    updateNotice = null;
  }

  function applyUpdate(force = false) {
    if (!pending || refreshing || document.visibilityState === 'hidden') return false;
    if (!force && (hasUnsavedWork() || Date.now() - lastInteraction < IDLE_MS)) return false;
    if (force && hasUnsavedWork() && !window.confirm('Bạn đang có nội dung chưa lưu. Cập nhật ngay có thể làm mất nội dung đang nhập. Tiếp tục?')) return false;
    refreshing = true;
    remember(pending);
    hideNotice();
    window.location.reload();
    return true;
  }

  function showNotice() {
    if (updateNotice || !pending || !document.body) return;
    const notice = document.createElement('div');
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    notice.style.cssText = 'position:fixed;z-index:2147483000;right:12px;left:12px;bottom:calc(78px + env(safe-area-inset-bottom, 0px));max-width:430px;margin-left:auto;padding:12px 14px;border-radius:12px;background:#173b56;color:#fff;box-shadow:0 8px 28px #102b4055;font:600 13px/1.45 system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:space-between;gap:10px';
    const label = document.createElement('span');
    label.textContent = 'ESTA có phiên bản mới';
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Cập nhật';
    button.style.cssText = 'flex:none;cursor:pointer;border:0;border-radius:8px;background:#f3debf;color:#173b56;padding:9px 12px;font:700 12px system-ui,-apple-system,sans-serif';
    button.addEventListener('click', () => applyUpdate(true));
    notice.append(label, button);
    document.body.appendChild(notice);
    updateNotice = notice;
  }

  function updateAvailable(version) {
    if (version === lastKnown) return;
    pending = version;
    if (!applyUpdate()) showNotice();
  }

  async function checkVersion() {
    if (checking || refreshing || !navigator.onLine || document.visibilityState === 'hidden') return;
    checking = true;
    try {
      const response = await fetch(VERSION_URL, {
        method: 'GET', cache: 'no-store', credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) return;
      const data = await response.json();
      const version = typeof data.version === 'string' ? data.version.trim() : '';
      if (!version || version.length > 200) return;
      // First successful check establishes the baseline. Later releases trigger refresh.
      if (!lastKnown) remember(version);
      else updateAvailable(version);
    } catch (_) { /* Offline or deployment in progress: keep the current screen. */ }
    finally { checking = false; }
  }

  function wake() {
    if (document.visibilityState === 'hidden') return;
    if (pending && applyUpdate()) return;
    if (navigator.onLine && workerRegistration) workerRegistration.update().catch(() => {});
    checkVersion();
  }

  // A dirty form is never auto-discarded, including the task form's image picker.
  document.addEventListener('input', event => {
    lastInteraction = Date.now();
    if (event.target.closest && event.target.closest('form')) draftTouched = true;
  }, true);
  document.addEventListener('change', event => {
    lastInteraction = Date.now();
    if (event.target.closest && event.target.closest('form')) draftTouched = true;
  }, true);
  document.addEventListener('pointerdown', () => { lastInteraction = Date.now(); }, { passive: true, capture: true });
  document.addEventListener('keydown', () => { lastInteraction = Date.now(); }, true);

  // ESTA indicates a successful task save with “Đã lưu”. Do not clear the guard on submit alone.
  function watchSave() {
    const save = document.getElementById('saveBtn');
    if (!save) return;
    new MutationObserver(() => {
      if (/đã lưu/i.test(save.textContent || '')) {
        draftTouched = false;
        if (pending) window.setTimeout(() => applyUpdate(), IDLE_MS);
      }
    }).observe(save, { childList: true, subtree: true, characterData: true });
  }

  window.addEventListener('load', () => {
    watchSave();
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then(reg => { workerRegistration = reg; reg.update().catch(() => {}); })
      .catch(error => console.warn('ESTA PWA unavailable:', error));
    checkVersion();
    window.setInterval(() => {
      if (pending) { if (!applyUpdate()) showNotice(); }
      else checkVersion();
    }, POLL_MS);
  }, { once: true });
  window.addEventListener('pageshow', wake);
  window.addEventListener('focus', wake);
  window.addEventListener('online', wake);
  document.addEventListener('visibilitychange', wake);
})();
