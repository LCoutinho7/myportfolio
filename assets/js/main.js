gsap.registerPlugin(ScrollTrigger);

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const setTheme = t => { document.body.dataset.theme = t; };

/* ── Nav ── */
const nav = $('.nav');
const burger = $('#burger');
const menu = $('#menu');
addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 60), { passive: true });

const toggleMenu = open => {
  document.body.classList.toggle('menu-open', open);
  menu.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', open);
};
burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('is-open')));
$$('a', menu).forEach(a => a.addEventListener('click', () => toggleMenu(false)));

/* ── Tema dinâmico: fundo/texto invertem conforme a seção em foco ── */
$$('section[data-theme]').forEach(sec => {
  const apply = () => setTheme(sec.dataset.theme);
  ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onEnter: apply, onEnterBack: apply });
});

/* ── Hero: nome em uma linha, colado no bottom ── */
const name = $('.hero__name');
const fitName = () => {
  name.style.fontSize = '100px';
  name.style.fontSize = (100 * name.parentElement.clientWidth / name.scrollWidth) + 'px';
};

function heroIntro() {
  fitName();
  addEventListener('resize', fitName);
  const chars = new SplitType(name, { types: 'chars' }).chars;
  gsap.set(name, { opacity: 1 });
  if (reduce) return;

  gsap.from(chars, { yPercent: 40, opacity: 0, duration: 1.2, ease: 'power4.out', stagger: 0.035 });
  gsap.from('.hero__meta', { opacity: 0, duration: 1, delay: 0.6 });

  // parallax de saída: nome atrasa e some
  const st = { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('[data-hero-base]', { y: () => innerHeight * 0.22, ease: 'none', scrollTrigger: st });
  // nome some antes de invadir a seção seguinte
  gsap.to('[data-hero-base]', { opacity: 0, ease: 'none', scrollTrigger: { ...st, end: 'bottom 55%' } });
}

/* ── Parallax genérico: [data-speed] ── */
function parallax() {
  if (reduce) return;
  $$('[data-speed]').forEach(el => {
    const s = parseFloat(el.dataset.speed);
    gsap.fromTo(el,
      { y: () => s * innerHeight * 0.3 },
      { y: () => -s * innerHeight * 0.3, ease: 'none', scrollTrigger: {
          trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true,
      } });
  });
}

/* ── Texto que acende palavra a palavra ── */
function scrubText() {
  $$('[data-scrub]').forEach(el => {
    const words = new SplitType(el, { types: 'words' }).words;
    if (reduce) return;
    gsap.fromTo(words, { opacity: 0.16 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true },
    });
  });
}

/* ── Reveals + contadores ── */
function reveals() {
  $$('[data-reveal]').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  $$('[data-count]').forEach(el => {
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () =>
      gsap.to(o, { v: +el.dataset.count, duration: reduce ? 0 : 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }) });
  });
}

/* ── Projetos: pilha que se espalha em órbita radial ── */
function projects() {
  const sec = $('#projects-section');
  const cards = $$('.pcard', sec);
  const intro = $('.proj__intro', sec);
  const tilt = [-4, 3, -2, 4, -3];
  const at = i => {
    const a = i * 2 * Math.PI / cards.length - Math.PI / 2;
    return { x: Math.cos(a) * innerWidth * 0.34, y: Math.sin(a) * innerHeight * 0.29 };
  };
  const mm = gsap.matchMedia();

  mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
    gsap.set(cards, { xPercent: -50, yPercent: -50, x: i => (i - 2) * 16, y: i => (i - 2) * 6, rotation: i => (i - 2) * 4, scale: 0.62, zIndex: i => i + 1 });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: 'top top', end: '+=2600', pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        onToggle: s => s.isActive && setTheme('dark'),
        onUpdate: s => sec.classList.toggle('is-spread', s.progress > 0.95),
      },
    });
    tl.fromTo(intro, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'none' }, 0.4)
      .to(cards, { x: i => at(i).x, y: i => at(i).y, rotation: i => tilt[i], scale: 1, duration: 1, ease: 'power3.inOut' }, 0)
      .to({}, { duration: 0.3 });
    return () => sec.classList.remove('is-spread');
  });

  mm.add('(min-width: 769px) and (prefers-reduced-motion: reduce)', () => {
    gsap.set(cards, { xPercent: -50, yPercent: -50, x: i => at(i).x, y: i => at(i).y, rotation: i => tilt[i] });
    sec.classList.add('is-spread');
    return () => sec.classList.remove('is-spread');
  });
}

heroIntro();
parallax();
scrubText();
reveals();
projects();
document.fonts.ready.then(() => { fitName(); ScrollTrigger.refresh(); });
addEventListener('load', () => ScrollTrigger.refresh());
