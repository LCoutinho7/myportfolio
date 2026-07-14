/* ─────────────────────────────────────────────
   app.js — Main Orchestrator
   
   Responsibilities:
   – Loader sequence
   – Boot order (ensures DOM + libs ready)
   – Calls init functions from other modules
   – No animation or UI logic lives here
   ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   LOADER
   ───────────────────────────────────────────── */
const Loader = (() => {
  const DURATION_MS = 1800; // Total loader duration

  let counterEl  = null;
  let barFillEl  = null;
  let loaderEl   = null;
  let startTime  = null;
  let rafId      = null;

  function init() {
    counterEl = document.getElementById('loader-count');
    barFillEl = document.getElementById('loader-bar');
    loaderEl  = document.getElementById('loader');
  }

  function tick(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / DURATION_MS, 1);

    // Ease-out progress curve for cinematic feel
    const eased = 1 - Math.pow(1 - progress, 3);
    const count = Math.round(eased * 100);

    counterEl.textContent = count;
    barFillEl.style.width = (eased * 100) + '%';

    if (progress < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      exit();
    }
  }

  function exit() {
    gsap.to(loaderEl, {
      yPercent:  -100,
      duration:  1,
      ease:      'power3.inOut',
      onComplete: () => {
        loaderEl.style.display = 'none';
        document.body.classList.remove('is-loading');
      },
    });

    // Start site after loader begins exiting
    gsap.delayedCall(0.4, bootSite);
  }

  function start() {
    init();
    requestAnimationFrame(tick);
  }

  return { start };
})();

/* ─────────────────────────────────────────────
   BOOT SEQUENCE
   Order matters: scroll helpers → interactions → animations
   ───────────────────────────────────────────── */
function bootSite() {
  // 1. Native scroll helpers
  initSmoothScroll();

  // 2. GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // 3. Canvas particles (independent, visual only)
  initHeroCanvas();

  // 4. Cursor (independent)
  initCursor();

  // 5. Mouse glow
  initMouseGlow();

  // 6. Nav
  initNav();

  // 7. Mobile menu
  initMobileMenu();

  // 8. Scroll progress
  initScrollProgress();

  // 9. Hero entrance (timed, runs once)
  animateHeroEntrance();

  // 10. Orb parallax
  initOrbParallax();

  // 11. Section title split animations
  initSectionTitleAnimations();

  // 12. Generic scroll reveals
  initScrollReveals();

  // 13. Timeline
  initTimelineAnimation();

  // 14. Counters
  initCounters();

  // 15. Magnetic buttons
  initMagneticButtons();

  // 16. Project tilt
  initProjectTilt();

  // 17. Tag stagger reveals
  initTagsReveal();

  // 18. Resize handler (last)
  initResizeHandler();

  // Final ScrollTrigger refresh after all setup
  gsap.delayedCall(0.1, () => ScrollTrigger.refresh());
}

/* ─────────────────────────────────────────────
   ENTRY POINT
   Wait for DOM, then start loader.
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('is-loading');
  initMobileMenu();

  // Register GSAP plugin early (before bootSite)
  gsap.registerPlugin(ScrollTrigger);

  Loader.start();
});
