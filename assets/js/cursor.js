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

function initCursor() {
  // Skip on touch-only devices
  if (window.matchMedia('(hover: none)').matches) return;

  cursorDot  = document.getElementById('lf-cursor');
  cursorRing = document.getElementById('lf-cursor-ring');

  if (!cursorDot || !cursorRing) return;

  document.addEventListener('mousemove', onMouseMove, { passive: true });

  // Spring-based ring loop
  requestAnimationFrame(animateRing);

  // Hover states on interactive elements
  document.querySelectorAll(CURSOR_SELECTORS).forEach(attachHoverStates);

  // Also watch for dynamically added elements (none in this project, but good practice)
  observeNewElements();
}

function onMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  // Dot snaps immediately to cursor position
  gsap.set(cursorDot, { x: mouseX, y: mouseY });
}

function animateRing() {
  // Spring: ring lazily chases the cursor
  const SPRING = 0.095;
  ringX += (mouseX - ringX) * SPRING;
  ringY += (mouseY - ringY) * SPRING;
  gsap.set(cursorRing, { x: ringX, y: ringY });
  requestAnimationFrame(animateRing);
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

function observeNewElements() {
  // MutationObserver pattern — for future dynamic content
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.matches?.(CURSOR_SELECTORS)) attachHoverStates(node);
        node.querySelectorAll?.(CURSOR_SELECTORS).forEach(attachHoverStates);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
