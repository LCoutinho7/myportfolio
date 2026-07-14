/* ─────────────────────────────────────────────
   interactions.js
   UI micro-interactions: magnetic buttons,
   counters, project tilt, nav, mobile menu,
   scroll progress, mouse glow, tag reveals.
   ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   NAV — scrolled class + anchor scroll
   ───────────────────────────────────────────── */
function initNav() {
  const nav = document.querySelector('.lf-nav');
  if (!nav) return;

  ScrollTrigger.create({
    start:       '80px top',
    onEnter:     () => nav.classList.add('is-scrolled'),
    onLeaveBack: () => nav.classList.remove('is-scrolled'),
  });

  // Smooth anchor scroll (delegated)
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    if (menuOpen || link.classList.contains('lf-mobile-menu__link')) {
      closeMobileMenu();
      requestAnimationFrame(() => scrollToTarget(target, -80));
      return;
    }

    scrollToTarget(target, -80);
  });
}

/* ─────────────────────────────────────────────
   MOBILE MENU
   ───────────────────────────────────────────── */
let menuOpen = false;

function initMobileMenu() {
  const burger = document.getElementById('nav-burger');
  const menu   = document.getElementById('mobile-menu');
  if (!burger || !menu) return;
  if (burger.dataset.menuReady === 'true') return;

  burger.dataset.menuReady = 'true';

  burger.addEventListener('click', () => {
    menuOpen ? closeMobileMenu() : openMobileMenu();
  });
}

function openMobileMenu() {
  menuOpen = true;
  document.body.classList.add('is-menu-open');
  document.getElementById('mobile-menu').classList.add('is-open');
  document.getElementById('mobile-menu').setAttribute('aria-hidden', 'false');
  document.getElementById('nav-burger').classList.add('is-active');
  document.getElementById('nav-burger').setAttribute('aria-expanded', 'true');
}

function closeMobileMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  document.body.classList.remove('is-menu-open');
  document.getElementById('mobile-menu')?.classList.remove('is-open');
  document.getElementById('mobile-menu')?.setAttribute('aria-hidden', 'true');
  document.getElementById('nav-burger')?.classList.remove('is-active');
  document.getElementById('nav-burger')?.setAttribute('aria-expanded', 'false');
}

/* ─────────────────────────────────────────────
   SCROLL PROGRESS BAR
   ───────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress-bar');
  if (!bar) return;

  ScrollTrigger.create({
    start:    'top top',
    end:      'bottom bottom',
    onUpdate: self => {
      bar.style.transform = `scaleX(${self.progress.toFixed(4)})`;
    },
  });
}

/* ─────────────────────────────────────────────
   MAGNETIC BUTTONS
   Physics-based magnetic pull on hover.
   ───────────────────────────────────────────── */
function initMagneticButtons() {
  // Skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    btn._magneticTween = gsap.quickTo(btn, 'x', { duration: 0.25, ease: 'power2.out' });
    btn._magneticTweenY = gsap.quickTo(btn, 'y', { duration: 0.25, ease: 'power2.out' });
    btn.addEventListener('mousemove', onMagneticMove, { passive: true });
    btn.addEventListener('mouseleave', onMagneticLeave, { passive: true });
  });
}

function onMagneticMove(e) {
  const rect  = this.getBoundingClientRect();
  const cx    = rect.left + rect.width  / 2;
  const cy    = rect.top  + rect.height / 2;
  const dx    = (e.clientX - cx) * 0.38;
  const dy    = (e.clientY - cy) * 0.38;

  this._magneticTween?.(dx);
  this._magneticTweenY?.(dy);
}

function onMagneticLeave() {
  gsap.to(this, {
    x: 0, y: 0,
    duration: 0.6,
    ease: 'elastic.out(1, 0.4)',
  });
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTERS
   ───────────────────────────────────────────── */
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const obj    = { value: 0 };

    ScrollTrigger.create({
      trigger: el,
      start:   'top 85%',
      once:    true,
      onEnter: () => {
        gsap.to(obj, {
          value:    target,
          duration: 1.8,
          ease:     'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.value);
          },
        });
      },
    });
  });
}

/* ─────────────────────────────────────────────
   PROJECT CARD 3D TILT
   Subtle rotateX/Y following mouse position.
   ───────────────────────────────────────────── */
function initProjectTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.project-card').forEach(card => {
    const rotateXTo = gsap.quickTo(card, 'rotateX', { duration: 0.25, ease: 'power2.out' });
    const rotateYTo = gsap.quickTo(card, 'rotateY', { duration: 0.25, ease: 'power2.out' });

    card.addEventListener('mousemove', e => {
      const rect    = card.getBoundingClientRect();
      const xRatio  = (e.clientX - rect.left) / rect.width  - 0.5;
      const yRatio  = (e.clientY - rect.top)  / rect.height - 0.5;

      rotateXTo(-yRatio * 2);
      rotateYTo(xRatio * 2);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0,
        duration: 0.7,
        ease:     'elastic.out(1, 0.3)',
      });
    });
  });
}

/* ─────────────────────────────────────────────
   MOUSE GLOW TRAIL
   ───────────────────────────────────────────── */
function initMouseGlow() {
  if (window.matchMedia('(hover: none)').matches) return;

  const glow = document.querySelector('.lf-mouse-glow');
  if (!glow) return;
  gsap.set(glow, { xPercent: -50, yPercent: -50 });
  const xTo = gsap.quickTo(glow, 'x', { duration: 0.45, ease: 'power2.out' });
  const yTo = gsap.quickTo(glow, 'y', { duration: 0.45, ease: 'power2.out' });

  document.addEventListener('mousemove', e => {
    xTo(e.clientX);
    yTo(e.clientY);
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   STACK TAGS STAGGER REVEAL
   ───────────────────────────────────────────── */
function initTagsReveal() {
  document.querySelectorAll('.stack__category').forEach((category, index) => {
    const tags = category.querySelectorAll('.tag');

    ScrollTrigger.create({
      trigger: category,
      start:   'top 85%',
      once:    true,
      onEnter: () => {
        category.querySelector('.stack__tags').classList.add('tags-revealed');
        gsap.to(tags, {
          opacity:  1,
          y:        0,
          scale:    1,
          duration: 0.5,
          ease:     'power3.out',
          stagger:  0.055,
          delay:    index * 0.07,
        });
      },
    });
  });
}

/* ─────────────────────────────────────────────
   RESIZE HANDLER (debounced)
   ───────────────────────────────────────────── */
function initResizeHandler() {
  let timer = null;

  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => ScrollTrigger.refresh(), 200);
  }, { passive: true });
}
