/* ESTA mobile navigation adapter; delegates to the real navigation and never bypasses rights. */
(() => {
  "use strict";
  const app = document.getElementById("app");
  const bar = document.getElementById("estaBottomNav");
  if (!app || !bar) return;

  const routes = [
    ["home", "navHome"],
    ["projects", "navAdmin"],
    ["work", "navWork"],
    ["energy", "navEnergy"],
    ["inventory", "navInventory"]
  ];
  const entries = routes.map(([key, id]) => ({
    key,
    source: document.getElementById(id),
    button: bar.querySelector('[data-esta-nav="' + key + '"]')
  })).filter(item => item.source && item.button);
  const more = bar.querySelector('[data-esta-action="more"]');
  const adminTasks = bar.querySelector('[data-esta-action="admin-tasks"]');
  const adminDispatch = bar.querySelector('[data-esta-action="admin-dispatch"]');

  function sync() {
    const on = !app.classList.contains("hide");
    for (const {source, button} of entries) {
      // The sidebar remains the permission/source-of-truth for available modules.
      const visible = on && !source.classList.contains("hide") && !source.hidden;
      button.hidden = !visible;
      const active = visible && source.classList.contains("active");
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
    // Admin shortcuts exist only in the Admin command center and never reveal
    // a module that the logged-in account cannot access.
    const adminHome = on && app.classList.contains("homeMode") &&
      app.classList.contains("adminCommandHome");
    if (adminTasks) adminTasks.hidden = !adminHome;
    if (adminDispatch) adminDispatch.hidden = !adminHome;
    if (more) {
      more.hidden = !on;
      more.setAttribute("aria-expanded", String(app.classList.contains("menuOpen")));
    }
  }

  for (const {source, button} of entries) {
    button.addEventListener("click", () => {
      if (source.hidden || source.classList.contains("hide")) return;
      // Retain app.js's Admin vs project routing, close overlays and permission checks.
      source.click();
      window.requestAnimationFrame(sync);
    });
  }
  adminTasks?.addEventListener("click", () => {
    if (!app.classList.contains("adminCommandHome") || app.classList.contains("hide")) return;
    const section = document.getElementById("ccTaskTitle")?.closest(".ccPanel");
    section?.scrollIntoView({behavior: "smooth", block: "start"});
  });
  adminDispatch?.addEventListener("click", () => {
    if (!app.classList.contains("adminCommandHome") || app.classList.contains("hide")) return;
    const source = document.getElementById("ccHeaderDispatch") || document.getElementById("ccDispatch");
    if (source && !source.disabled) source.click();
  });

  more?.addEventListener("click", () => {
    const menu = document.getElementById("menu");
    if (menu && !app.classList.contains("hide")) menu.click();
    window.requestAnimationFrame(sync);
  });

  const observer = new MutationObserver(sync);
  observer.observe(app, {attributes: true, attributeFilter: ["class"]});
  for (const {source} of entries) {
    observer.observe(source, {attributes: true, attributeFilter: ["class", "hidden"]});
  }
  const menuBackdrop = document.getElementById("menuBackdrop");
  if (menuBackdrop) observer.observe(menuBackdrop, {attributes: true, attributeFilter: ["hidden"]});

  function isTypingField(target) {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable || target.matches("textarea, select")) return true;
    if (!target.matches("input")) return false;
    return !["button", "checkbox", "color", "file", "hidden", "image", "radio", "range", "reset", "submit"].includes(target.type);
  }
  document.addEventListener("focusin", event => {
    if (isTypingField(event.target)) document.body.classList.add("estaKeyboardOpen");
  });
  document.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!isTypingField(document.activeElement)) document.body.classList.remove("estaKeyboardOpen");
    }, 100);
  });
  window.addEventListener("resize", sync, {passive: true});
  sync();
})();
