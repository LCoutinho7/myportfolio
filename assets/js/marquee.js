/* ─────────────────────────────────────────────
   marquee.js
   Scroll horizontal infinito via RAF + GSAP.

   Estratégia:
   – Clona o track original → 2 tracks lado a lado no inner
   – Anima o inner com translateX de 0 até -trackWidth
   – Quando atinge -trackWidth, reseta para 0 (imperceptível)
   – Resultado: loop perfeito e sem saltos

   Features:
   – Pausa no hover
   – Respeita prefers-reduced-motion
   – Velocidade configurável via data-speed
   ───────────────────────────────────────────── */

const MARQUEE_SPEED_PX_PER_SEC = 65; // pixels por segundo

function initMarquee() {
  const marqueeEl = document.getElementById('lf-marquee');
  const innerEl   = document.getElementById('lf-marquee-inner');
  if (!marqueeEl || !innerEl) return;

  // Respeita preferência do usuário
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReducedMotion) return;

  // Clona o track original para garantir conteúdo contínuo
  const originalTrack = innerEl.querySelector('.lf-marquee__track');
  if (!originalTrack) return;

  const clonedTrack = originalTrack.cloneNode(true);
  clonedTrack.setAttribute('aria-hidden', 'true');
  innerEl.appendChild(clonedTrack);

  // Aguarda o layout estabilizar antes de medir
  requestAnimationFrame(() => {
    const trackWidth = originalTrack.getBoundingClientRect().width;

    let currentX  = 0;
    let isPaused  = false;
    let rafId     = null;
    let lastTime  = null;

    function tick(timestamp) {
      if (lastTime === null) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      if (!isPaused) {
        currentX -= (MARQUEE_SPEED_PX_PER_SEC * delta) / 1000;

        // Reset instantâneo quando o primeiro track sai completamente
        if (Math.abs(currentX) >= trackWidth) {
          currentX += trackWidth;
        }

        // GPU-friendly transform via GSAP set (evita layout thrashing)
        gsap.set(innerEl, { x: currentX });
      }

      rafId = requestAnimationFrame(tick);
    }

    // Pause on hover
    marqueeEl.addEventListener('mouseenter', () => { isPaused = true;  }, { passive: true });
    marqueeEl.addEventListener('mouseleave', () => { isPaused = false; }, { passive: true });

    // Inicia o loop
    rafId = requestAnimationFrame(tick);

    // Cleanup se necessário (SPA ou unmount)
    marqueeEl._marqueeCleanup = () => {
      cancelAnimationFrame(rafId);
      marqueeEl.removeEventListener('mouseenter', () => { isPaused = true;  });
      marqueeEl.removeEventListener('mouseleave', () => { isPaused = false; });
    };
  });
}