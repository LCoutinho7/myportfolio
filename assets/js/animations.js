/* ─────────────────────────────────────────────
   animations.js
   All GSAP-driven animations:
   – Hero entrance sequence
   – Section title splits
   – Scroll reveals
   – Timeline line draw
   – Orb parallax
   ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   HERO ENTRANCE
   Runs once after loader exits.
   ───────────────────────────────────────────── */
function animateHeroEntrance() {
  const titleLines = document.querySelectorAll('.hero__title-line[data-split]');

  titleLines.forEach(line => {
    // Ensure container stays visible; SplitType handles chars
    line.style.opacity = '1';

    const split = new SplitType(line, { types: 'chars' });

    // Explicit fromTo — guarantees final state regardless of interruption
    gsap.fromTo(
      split.chars,
      { yPercent: 115, opacity: 0 },
      {
        yPercent:   0,
        opacity:    1,
        duration:   1.1,
        ease:       'power4.out',
        stagger:    0.028,
        delay:      1.15,
        clearProps: 'yPercent,opacity', // Remove inline styles after animation
      }
    );
  });

  // Eyebrow
  gsap.fromTo(
    '.hero__eyebrow',
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 1.05 }
  );

  // Description
  gsap.fromTo(
    '.hero__desc',
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 1.5 }
  );

  // CTA buttons
  gsap.fromTo(
    '.hero__actions',
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 1.65 }
  );

  // Scroll hint
  gsap.fromTo(
    '.hero__scroll-hint',
    { opacity: 0 },
    { opacity: 1, duration: 1, ease: 'power2.out', delay: 2.1 }
  );
}

/* ─────────────────────────────────────────────
   ORB PARALLAX
   Subtle depth movement on hero scroll.
   ───────────────────────────────────────────── */
function initOrbParallax() {
  gsap.to('.hero__orb--1', {
    yPercent: -25,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start:   'top top',
      end:     'bottom top',
      scrub:   1.2,
    },
  });

  gsap.to('.hero__orb--2', {
    yPercent: -15,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start:   'top top',
      end:     'bottom top',
      scrub:   1.5,
    },
  });
}

/* ─────────────────────────────────────────────
   SECTION TITLE REVEAL
   Split by lines, reveal with masked slide.
   ───────────────────────────────────────────── */
function initSectionTitleAnimations() {
  document.querySelectorAll('.section-header__title').forEach(title => {
    const split = new SplitType(title, { types: 'lines' });

    // Wrap each line in a clip container
    split.lines.forEach(line => {
      const wrapper = document.createElement('div');
      wrapper.style.overflow = 'hidden';
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    gsap.fromTo(
      split.lines,
      { yPercent: 105, opacity: 0 },
      {
        yPercent:   0,
        opacity:    1,
        duration:   0.95,
        ease:       'power4.out',
        stagger:    0.09,
        clearProps: 'yPercent,opacity',
        scrollTrigger: {
          trigger: title,
          start:   'top 87%',
          once:    true,
        },
      }
    );
  });
}

/* ─────────────────────────────────────────────
   GENERIC SCROLL REVEALS
   Handles all [data-reveal] elements.
   ───────────────────────────────────────────── */
function initScrollReveals() {
  document.querySelectorAll('[data-reveal]').forEach(el => {
    const delay = parseFloat(el.dataset.revealDelay || 0);

    gsap.to(el, {
      opacity:  1,
      y:        0,
      duration: 0.85,
      ease:     'power3.out',
      delay,
      scrollTrigger: {
        trigger: el,
        start:   'top 88%',
        once:    true,
      },
    });
  });
}

/* ─────────────────────────────────────────────
   TIMELINE LINE DRAW
   ───────────────────────────────────────────── */
function initTimelineAnimation() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  // Pseudo-element can't be targeted directly — animate a real element instead
  gsap.fromTo(
    timeline,
    { '--line-scale': 0 },
    {
      '--line-scale': 1,
      duration:       1.5,
      ease:           'power3.out',
      scrollTrigger: {
        trigger: timeline,
        start:   'top 80%',
        once:    true,
      },
    }
  );
}

/* ─────────────────────────────────────────────
   HERO CANVAS PARTICLES
   Lightweight canvas dot field with mouse repel.
   ───────────────────────────────────────────── */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx      = canvas.getContext('2d');
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const COUNT    = isMobile ? 35 : 80;

  let W, H, particles;
  let mouseX = -9999;
  let mouseY = -9999;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function buildParticles() {
    particles = Array.from({ length: COUNT }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.4 + 0.3,
      vx:    (Math.random() - 0.5) * 0.22,
      vy:    (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.45 + 0.08,
    }));
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      if (!isMobile) {
        const dx   = p.x - mouseX;
        const dy   = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          const force = (110 - dist) / 110;
          p.vx += (dx / dist) * force * 0.14;
          p.vy += (dy / dist) * force * 0.14;
        }
      }

      p.vx *= 0.978;
      p.vy *= 0.978;
      p.x  += p.vx;
      p.y  += p.vy;

      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,120,255,${p.alpha})`;
      ctx.fill();
    });

    // Connection lines
    for (let i = 0; i < particles.length - 1; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99,120,255,${0.055 * (1 - dist / 110)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawFrame);
  }

  resize();
  buildParticles();
  drawFrame();

  window.addEventListener('resize', () => {
    resize();
    buildParticles();
  }, { passive: true });

  if (!isMobile) {
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }, { passive: true });
  }
}
