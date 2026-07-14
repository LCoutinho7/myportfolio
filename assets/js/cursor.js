/* ─────────────────────────────────────────────
   cursor.js
   Custom cursor: dot + trailing ring.
   Degrades gracefully on touch devices.
   ───────────────────────────────────────────── */

const CURSOR_SELECTORS = 'a, button, .tag, .project-card, .btn';

let cursorDot  = null;
let cursorRing = null;
let mouseX     = 0;
let mouseY     = 0;
let ringX      = 0;
let ringY      = 0;
let rafId      = null;
let setDotX    = null;
let setDotY    = null;
let setRingX   = null;
let setRingY   = null;

function initCursor() {
  // Skip on touch-only devices
  if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return;

  cursorDot  = document.getElementById('lf-cursor');
  cursorRing = document.getElementById('lf-cursor-ring');

  if (!cursorDot || !cursorRing) return;

  setDotX = gsap.quickSetter(cursorDot, 'x', 'px');
  setDotY = gsap.quickSetter(cursorDot, 'y', 'px');
  setRingX = gsap.quickSetter(cursorRing, 'x', 'px');
  setRingY = gsap.quickSetter(cursorRing, 'y', 'px');

  document.addEventListener('mousemove', onMouseMove, { passive: true });

  // Spring-based ring loop
  rafId = requestAnimationFrame(animateRing);

  // Hover states on interactive elements
  document.querySelectorAll(CURSOR_SELECTORS).forEach(attachHoverStates);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
      return;
    }
    if (!document.hidden && !rafId) rafId = requestAnimationFrame(animateRing);
  });
}

function onMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  // Dot snaps immediately to cursor position
  setDotX(mouseX);
  setDotY(mouseY);
}

function animateRing() {
  // Spring: ring lazily chases the cursor
  const SPRING = 0.095;
  ringX += (mouseX - ringX) * SPRING;
  ringY += (mouseY - ringY) * SPRING;
  setRingX(ringX);
  setRingY(ringY);
  rafId = requestAnimationFrame(animateRing);
}

function attachHoverStates(el) {
  el.addEventListener('mouseenter', onEnterInteractive, { passive: true });
  el.addEventListener('mouseleave', onLeaveInteractive, { passive: true });
}

function onEnterInteractive() {
  gsap.to(cursorDot, {
    width: 44, height: 44,
    duration: 0.35,
    ease: 'power2.out',
  });
  gsap.to(cursorRing, {
    opacity: 0,
    duration: 0.2,
  });
}

function onLeaveInteractive() {
  gsap.to(cursorDot, {
    width: 8, height: 8,
    duration: 0.35,
    ease: 'power2.out',
  });
  gsap.to(cursorRing, {
    opacity: 1,
    duration: 0.3,
  });
}
