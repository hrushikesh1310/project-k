// Tiny helper script for a static multi-page site.
// - highlights the current page in the nav
// - (optional) supports anchor-like behavior for details blocks

(function () {
  function setRandomBackgroundImage() {
    const backgrounds = [
      "backgrounds/bg-1.jpg",
      "backgrounds/bg-2.jpg",
      "backgrounds/bg-3.jpg",
      "backgrounds/bg-4.jpg",
      "backgrounds/bg-5.jpg",
    ];

    // Pick a different image each time the page is opened/refreshed.
    const choice = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    // Note: --page-bg-image is used inside assets/styles.css, so the URL is
    // resolved relative to that stylesheet's location (assets/).
    document.documentElement.style.setProperty("--page-bg-image", `url('${choice}')`);
  }

  function highlightActiveNav() {
    const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const links = document.querySelectorAll(".nav-links a");
    links.forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === current) a.classList.add("active");
    });
  }

  function enableDetailsDeepLinking() {
    // If you navigate to a URL with #some-id and there is a <details id="some-id">,
    // we open it so the content is visible.
    const hash = (location.hash || "").replace("#", "");
    if (!hash) return;

    const el = document.getElementById(hash);
    if (!el) return;

    if (el.tagName.toLowerCase() === "details") {
      el.open = true;
      // scroll nicely
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    setRandomBackgroundImage();
    highlightActiveNav();
    enableDetailsDeepLinking();
  });
})();

// Cursor spotlight effect
// - Keeps the site dark-themed but lightens the region around the cursor.
// - Implemented via CSS vars consumed by body::before.
(function () {
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  // On touch devices, cursor tracking is not useful; keep it off.
  if (isCoarsePointer) return;

  const root = document.documentElement;
  let rafId = null;
  let lastX = 0;
  let lastY = 0;

  function setVars(x, y) {
    root.style.setProperty("--mx", `${x}px`);
    root.style.setProperty("--my", `${y}px`);
  }

  function onMove(e) {
    lastX = e.clientX;
    lastY = e.clientY;

    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      setVars(lastX, lastY);
      // Show spotlight once the user actually moves.
      root.style.setProperty("--spot-opacity", "1");
    });
  }

  function onLeave() {
    root.style.setProperty("--spot-opacity", "0");
  }

  // If user prefers reduced motion, we still allow the effect but avoid any
  // extra transitions (handled in CSS). We still update position.
  document.addEventListener("mousemove", onMove, { passive: true });
  document.addEventListener("mouseleave", onLeave, { passive: true });

  // Spotlight zoom (mouse-pointer portion)
  // - Hold Alt/Option and scroll to change the size of the cursor spotlight.
  // - We require a modifier key so we don't break normal page scrolling.
  // - Size is stored in a CSS variable used by body::before.
  (function enableSpotlightZoom() {
    const MIN = 120;
    const MAX = 720;
    const STEP = 28;

    function clamp(n, min, max) {
      return Math.min(max, Math.max(min, n));
    }

    function currentPx() {
      const raw = getComputedStyle(root).getPropertyValue("--spot-size").trim();
      const n = Number.parseFloat(raw);
      return Number.isFinite(n) ? n : 260;
    }

    function setPx(px) {
      root.style.setProperty("--spot-size", `${px}px`);
    }

    document.addEventListener(
      "wheel",
      (e) => {
        // macOS uses Option; Windows/Linux uses Alt.
        if (!e.altKey) return;

        // On trackpads, deltaY can be small; normalize to direction.
        const dir = e.deltaY > 0 ? -1 : 1; // scroll up => bigger spotlight
        const next = clamp(currentPx() + dir * STEP, MIN, MAX);
        setPx(next);

        // Ensure it is visible once user interacts.
        root.style.setProperty("--spot-opacity", "1");
        e.preventDefault();
      },
      { passive: false }
    );
  })();

  // For keyboard-only users: show spotlight near the focused element.
  document.addEventListener(
    "focusin",
    (e) => {
      const el = e.target;
      if (!(el instanceof HTMLElement)) return;
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + Math.min(r.height / 2, 80);
      setVars(x, y);
      root.style.setProperty("--spot-opacity", prefersReduced ? "0.9" : "1");
    },
    { passive: true }
  );
})();
