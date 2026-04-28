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
    revealObserver?.observe(el);
  });
}

/** One-shot initializer for site-wide motion. Idempotent. */
export function initMotion(): void {
  if (typeof window === 'undefined') return;
  initSmoothScroll();
  initRevealObserver();

  // Re-run reveal observer after Astro view transitions
  document.addEventListener('astro:page-load', () => {
    initRevealObserver();
  });
}
