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
