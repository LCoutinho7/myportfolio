/* ─────────────────────────────────────────────
   smooth-scroll.js
   Initializes Lenis and syncs with GSAP ticker.
   Exports: initSmoothScroll(), getSmoothScroll()
   ───────────────────────────────────────────── */

let lenisInstance = null;

/**
 * Initialize Lenis smooth scroll.
 * Respects reduced-motion preference by disabling smooth on those users.
 */
function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  lenisInstance = new Lenis({
    duration:        prefersReducedMotion ? 0 : isMobile ? 0.9 : 1.35,
    easing:          t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel:     !prefersReducedMotion,
    touchMultiplier: isMobile ? 1.8 : 1,
    infinite:        false,
  });

  // Sync Lenis with GSAP ticker (single RAF loop)
  gsap.ticker.add(time => lenisInstance.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Keep ScrollTrigger in sync with Lenis scroll position
  lenisInstance.on('scroll', ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        lenisInstance.scrollTo(value, { immediate: true });
      }
      return lenisInstance.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0, left: 0,
        width:  window.innerWidth,
        height: window.innerHeight,
      };
    },
  });
}

/**
 * Scroll to a target element smoothly via Lenis.
 * @param {Element|string} target - DOM element or CSS selector
 * @param {number} offset - pixel offset (e.g. -80 for nav height)
 */
function scrollTo(target, offset = -80) {
  if (!lenisInstance) return;
  lenisInstance.scrollTo(target, { offset, duration: 1.4 });
}

/**
 * Returns the Lenis instance for external use.
 * @returns {Lenis|null}
 */
function getSmoothScroll() {
  return lenisInstance;
}
