/**
 * Motion engine.
 *
 * Strategy:
 * - Lenis for smooth scroll on capable devices (skipped under prefers-reduced-motion).
 * - IntersectionObserver for [data-reveal] stagger reveals (CSS handles the actual transition).
 * - GSAP/ScrollTrigger lazy-imported only on pages that opt in via initCinematicScroll().
 *
 * Runs only in the browser. Safe to import from any island.
 */

let lenisInstance: { destroy: () => void } | null = null;
let revealObserver: IntersectionObserver | null = null;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Set `data-motion="cinematic"` on the document root when reduced-motion is
 * not preferred. CSS keys cinematic-only effects off this attribute so the
 * site stays calm for visitors who opted out.
 */
function syncCinematicAttr(): void {
  if (typeof document === 'undefined') return;
  const cinematic = !prefersReducedMotion();
  document.documentElement.dataset.motion = cinematic ? 'cinematic' : 'calm';
}

/**
 * Apply auto-stagger delay to a `[data-reveal]` element based on its index
 * within its parent. Honors a manual `data-stagger-index` override.
 */
const STAGGER_STEP_MS = 80;
const STAGGER_MAX = 6;
function applyStaggerDelay(el: HTMLElement): void {
  if (el.style.getPropertyValue('--reveal-delay')) return;
  const manual = el.dataset.staggerIndex;
  let idx: number;
  if (manual !== undefined && manual !== '') {
    idx = Math.max(0, parseInt(manual, 10) || 0);
  } else {
    const parent = el.parentElement;
    if (!parent) return;
    const siblings = Array.from(parent.children).filter((c) =>
      (c as HTMLElement).hasAttribute('data-reveal')
    );
    idx = siblings.indexOf(el);
  }
  const step = Math.min(idx, STAGGER_MAX);
  el.style.setProperty('--reveal-delay', `${step * STAGGER_STEP_MS}ms`);
}

/** Smooth scroll via Lenis. Idempotent. */
export async function initSmoothScroll(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (prefersReducedMotion() || lenisInstance) return;

  const { default: Lenis } = await import('lenis');
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  });

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  lenisInstance = lenis;
}

/** Observe all [data-reveal] elements and toggle data-reveal="in" on enter. */
export function initRevealObserver(): void {
  if (typeof window === 'undefined') return;
  if (prefersReducedMotion()) {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      el.setAttribute('data-reveal', 'in');
    });
    return;
  }

  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).setAttribute('data-reveal', 'in');
          revealObserver?.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
  );

  document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal="in"])').forEach((el) => {
    applyStaggerDelay(el);
    revealObserver?.observe(el);
  });
}

/**
 * Wrap any `<blockquote>` inside `<article>` containers with a [data-pullquote]
 * attribute and observe them for reveal. Lightweight; runs on every page so
 * MDX articles get the flourish without per-page wiring.
 */
function enhanceBlockquotes(): void {
  if (typeof document === 'undefined') return;
  if (prefersReducedMotion()) {
    document.querySelectorAll<HTMLElement>('article blockquote').forEach((bq) => {
      bq.setAttribute('data-pullquote', 'in');
    });
    return;
  }
  const quotes = document.querySelectorAll<HTMLElement>('article blockquote:not([data-pullquote])');
  if (quotes.length === 0) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-pullquote', 'in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );
  quotes.forEach((bq) => {
    bq.setAttribute('data-pullquote', '');
    io.observe(bq);
  });
}

/** One-shot initializer for site-wide motion. Idempotent. */
export function initMotion(): void {
  if (typeof window === 'undefined') return;
  syncCinematicAttr();
  initSmoothScroll();
  initRevealObserver();
  enhanceBlockquotes();

  // Re-run reveal observer after Astro view transitions
  document.addEventListener('astro:page-load', () => {
    syncCinematicAttr();
    initRevealObserver();
    enhanceBlockquotes();
  });

  // React to OS-level reduced-motion changes mid-session.
  window
    .matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', syncCinematicAttr);
}
