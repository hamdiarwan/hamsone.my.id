// Optional progressive enhancement. No transformed scroll wrapper: every
// scene, anchor and observer continues to read the browser's real scroll.
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 1101px) and (hover: hover) and (pointer: fine)');
const tokens = getComputedStyle(root);
const easing = tokens.getPropertyValue('--motion-ease').trim();
const duration = parseFloat(tokens.getPropertyValue('--motion-duration')) || 720;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const animations = new Set();
const reveals = new Map();
let revealObserver;

function trackAnimation(animation) {
  animations.add(animation);
  const clear = () => { animations.delete(animation); animation.cancel(); };
  animation.finished.then(clear, () => animations.delete(animation));
}
function animate(element, delay = 0, travel = 24) {
  element.style.opacity = '';
  trackAnimation(element.animate([
    { opacity: 0, translate: `0 ${travel}px` },
    { opacity: 1, translate: '0 0' },
  ], { duration, delay, easing, fill: 'both' }));
}

function sceneEntrance() {
  const stage = document.getElementById('heroStage');
  if (!stage || !Element.prototype.animate) return;
  const started = performance.now();
  // GPU setup may finish after the HTML's entrance. Start the canvas fade
  // only after its first rendered frame; never cancel it on an HTML timer.
  const ready = () => {
    if (!stage.classList.contains('scene-ready')) return;
    observer.disconnect();
    const canvas = document.querySelector('.portfolio-canvas');
    if (!canvas || reduced.matches || location.hash || scrollY > 8) return;
    trackAnimation(canvas.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration, easing, delay: Math.max(0, 680 - (performance.now() - started)), fill: 'both',
    }));
  };
  const observer = new MutationObserver(ready);
  observer.observe(stage, { attributes: true, attributeFilter: ['class'] });
  ready();
}

function heroEntrance() {
  const run = root.classList.contains('motion-boot') && !reduced.matches && scrollY < 8 && !location.hash;
  const title = document.getElementById('heroTitle');
  if (run && title && Element.prototype.animate) {
    const text = title.textContent;
    title.setAttribute('aria-label', text);
    const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    nodes.forEach(node => {
      const letters = [...node.textContent].map(character => {
        const letter = document.createElement('span');
        letter.className = 'hero-letter';
        letter.setAttribute('aria-hidden', 'true');
        letter.textContent = character;
        animate(letter, index++ * 38, 38);
        return letter;
      });
      node.replaceWith(...letters);
    });
    root.classList.add('motion-enter');
    document.querySelectorAll('.hero-role, .hero-sub, .hero-cta, .hero-chips, .hero-visual').forEach((element, i) => {
      animate(element, [300, 420, 530, 610, 680][i], desktop.matches ? 24 : 12);
    });
    setTimeout(() => root.classList.remove('motion-enter'), 1500);
  }
  root.classList.remove('motion-boot');
}

function staggerReveals() {
  if (reduced.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const record = reveals.get(entry.target);
      revealObserver.unobserve(entry.target);
      record.done = true;
      animate(entry.target, record.delay, desktop.matches ? 24 : 12);
    });
  }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });
  document.querySelectorAll('main > section:not(.hero)').forEach(section => {
    const candidates = section.querySelectorAll([
      '.section-eyebrow', '.section-title', '.section-sub', '.about-header',
      '.about-card', '.about-footer', '.project', '.service-card',
      '.coverflow', '.cf-controls', '.demo-window', '.demo-side', '.process-tabs',
      '.process-body', '.testimonial-reader', '#testiForm', '.faq details',
      '.contact-info', '#inquiryForm', '.proof-strip > div', '.terminal-section > .window',
    ].join(','));
    candidates.forEach((element, index) => {
      // Never animate a child twice under a revealing parent.
      if ([...candidates].some(parent => parent !== element && parent.contains(element))) return;
      element.style.opacity = '0';
      reveals.set(element, { done: false, delay: (index % 4) * 85 });
      revealObserver.observe(element);
    });
  });
}

// A short, bounded native-sticky hold. About retains its approved internal
// sticky scene and native scroll calculations; it is deliberately not wrapped.
const panels = [];
function stackPanels() {
  document.querySelectorAll('main > section:not(.about)').forEach((section, index) => {
    const shell = document.createElement('div');
    shell.className = 'motion-stack-shell';
    if (section.classList.contains('hero')) shell.classList.add('hero-shell');
    else shell.style.zIndex = String(index + 5);
    section.before(shell);
    shell.append(section);
    panels.push(section);
  });
  // Reuse the existing, real capability ticker rather than invent new copy.
  const ticker = document.querySelector('.marquee');
  const heroShell = document.querySelector('.hero-shell');
  if (ticker && heroShell) heroShell.after(ticker);
  const resize = new ResizeObserver(() => {
    const top = (document.querySelector('.nav')?.getBoundingClientRect().height || 72) + 12;
    panels.forEach(section => section.style.setProperty('--pin-top', `${Math.min(top, innerHeight - section.offsetHeight - 24)}px`));
  });
  panels.forEach(section => resize.observe(section));
  resize.observe(document.documentElement);
}

// Match the CSS cubic-bezier(.16,1,.3,1), including its x-axis timing.
function expoOut(progress) {
  if (progress <= 0 || progress >= 1) return clamp(progress, 0, 1);
  let low = 0, high = 1, t = progress;
  for (let i = 0; i < 12; i++) {
    const x = 3 * (1 - t) ** 2 * t * .16 + 3 * (1 - t) * t ** 2 * .3 + t ** 3;
    if (x < progress) low = t; else high = t;
    t = (low + high) / 2;
  }
  return 1 - (1 - t) ** 3;
}

let lenis = null, loadingLenis = false;
async function syncWheel() {
  const enabled = desktop.matches && !reduced.matches && !document.hidden;
  if (!enabled) { lenis?.destroy(); lenis = null; return; }
  if (lenis || loadingLenis) return;
  loadingLenis = true;
  try {
    const { default: Lenis } = await import('./assets/vendor/lenis.mjs');
    if (!desktop.matches || reduced.matches || document.hidden) return;
    lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      duration: duration / 1000,
      easing: expoOut,
      // Use the shared duration/easing instead of the alternative lerp mode.
      lerp: undefined,
      allowNestedScroll: true,
      anchors: false,
      virtualScroll: ({ event }) => event.type === 'wheel' && !event.ctrlKey && !event.shiftKey,
      prevent: node => node.matches('input, textarea, select, [contenteditable], .mobile-nav'),
    });
  } catch { /* Failed optional dependency = ordinary native scrolling. */ }
  finally { loadingLenis = false; }
}
function releaseWheel() {
  if (lenis?.isScrolling === 'smooth') lenis.scrollTo(scrollY, { immediate: true });
}
// Do not steal anchors, keyboard, scrollbar drag, touch, or browser find.
document.addEventListener('pointerdown', releaseWheel, { passive: true, capture: true });
document.addEventListener('touchstart', releaseWheel, { passive: true });
document.addEventListener('keydown', releaseWheel, { passive: true, capture: true });
document.addEventListener('click', event => {
  if (event.target.closest('a[href^="#"]')) releaseWheel();
}, true);

const progress = document.getElementById('scrollProgress');
const spySections = [...document.querySelectorAll('section[id]')];
const spyLinks = [...document.querySelectorAll('.nav-links a, .mobile-nav a')];
const visual = document.querySelector('.hero-visual');
const orbit = document.querySelector('.hero-orbit');
let scrollFrame = 0;
function updateScroll() {
  scrollFrame = 0;
  const max = root.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;
  let active = '';
  spySections.forEach(section => {
    const flow = section.parentElement.classList.contains('motion-stack-shell') ? section.parentElement : section;
    if (flow.getBoundingClientRect().top <= innerHeight * .36) active = `#${section.id}`;
  });
  spyLinks.forEach(link => {
    const selected = link.getAttribute('href') === active;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  if (visual && orbit) {
    const y = !reduced.matches && desktop.matches ? clamp(scrollY * .055, 0, 28) : 0;
    visual.style.translate = `0 ${y}px`;
    orbit.style.translate = `0 ${-y * .45}px`;
  }
}
function queueScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
window.addEventListener('scroll', queueScroll, { passive: true });
window.addEventListener('resize', queueScroll, { passive: true });
new ResizeObserver(queueScroll).observe(document.body);

// One pointer update per paint; never run tilt, magnetism or spotlight for
// touch input. Delegation also covers testimonials loaded from the real API.
let pointerFrame = 0, pointer = null;
const hoverState = new Map();
function clearHover() {
  hoverState.forEach((properties, element) => properties.forEach(name => element.style.removeProperty(name)));
  hoverState.clear();
}
function hoverProperties(element, properties) {
  if (element) hoverState.set(element, properties);
}
document.addEventListener('pointermove', event => {
  if (!desktop.matches || reduced.matches || event.pointerType === 'touch') return;
  pointer = { target: event.target, x: event.clientX, y: event.clientY };
  if (pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    pointerFrame = 0;
    clearHover();
    if (!pointer || reduced.matches || !desktop.matches) return;
    const { target, x, y } = pointer;
    const button = target.closest('.btn');
    const shot = target.closest('.shot-gallery .browser-frame');
    const card = target.closest('.card, .project, .about-card, .testi-card');
    if (button) {
      const bounds = button.getBoundingClientRect();
      button.style.translate = `${clamp((x - bounds.left - bounds.width / 2) * .08, -5, 5)}px ${clamp((y - bounds.top - bounds.height / 2) * .08, -5, 5)}px`;
      hoverProperties(button, ['translate']);
    }
    if (shot) {
      const bounds = shot.getBoundingClientRect();
      shot.style.setProperty('--tilt-x', `${clamp((.5 - (y - bounds.top) / bounds.height) * 7, -3.5, 3.5)}deg`);
      shot.style.setProperty('--tilt-y', `${clamp(((x - bounds.left) / bounds.width - .5) * 7, -3.5, 3.5)}deg`);
      hoverProperties(shot, ['--tilt-x', '--tilt-y']);
    }
    if (card) {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${x - bounds.left}px`);
      card.style.setProperty('--my', `${y - bounds.top}px`);
      hoverProperties(card, ['--mx', '--my']);
    }
  });
}, { passive: true });
document.documentElement.addEventListener('pointerleave', clearHover);
window.addEventListener('blur', clearHover);

function settleMotion() {
  if (reduced.matches) {
    root.classList.remove('motion-boot', 'motion-enter');
    animations.forEach(animation => animation.cancel());
    animations.clear();
    revealObserver?.disconnect();
    reveals.forEach((record, element) => { record.done = true; element.style.opacity = ''; });
    clearHover();
  }
  syncWheel();
  queueScroll();
}
document.addEventListener('focusin', event => {
  // A keyboard user can always reveal a target before it enters the viewport.
  reveals.forEach((record, element) => {
    if (!element.contains(event.target)) return;
    element.style.opacity = '';
    revealObserver?.unobserve(element);
    element.getAnimations().forEach(animation => animation.cancel());
    record.done = true;
  });
});
window.addEventListener('beforeprint', () => {
  animations.forEach(animation => animation.cancel());
  reveals.forEach((record, element) => { element.style.opacity = ''; });
});
reduced.addEventListener('change', settleMotion);
desktop.addEventListener('change', () => { clearHover(); settleMotion(); });
document.addEventListener('visibilitychange', syncWheel);
heroEntrance();
sceneEntrance();
staggerReveals();
stackPanels();
syncWheel();
updateScroll();
