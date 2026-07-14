/* ─────────────────────────────────────────────
   smooth-scroll.js
   Native scroll helpers.
   ScrollTrigger uses the browser's real scroll position.
   ───────────────────────────────────────────── */

function initSmoothScroll() {
  return true;
}

/**
 * Scroll to a target element using native browser scroll.
 * @param {Element|string} target - DOM element or CSS selector
 * @param {number} offset - pixel offset (e.g. -80 for nav height)
 */
function scrollToTarget(target, offset = -80) {
  const targetEl = typeof target === 'string'
    ? document.querySelector(target)
    : target;
  if (!targetEl) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const top = targetEl.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({
    top,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });
}
