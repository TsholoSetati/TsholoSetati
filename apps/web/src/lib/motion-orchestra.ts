/**
 * Motion orchestrator, cinematic layer.
 *
 * Lazy-imports heavy libs (GSAP, ScrollTrigger) only when an opt-in helper is
 * called by a specific page island. Everything is gated by
 * `prefers-reduced-motion` and the `data-motion="cinematic"` attribute on
 * `<html>` so visitors who prefer reduced motion get a static experience.
 *
 * Safe to import from any island. All initializers are idempotent and cleanly
 * re-bind after Astro view transitions.
 */

type Cleanup = () => void;

const cleanups = new WeakMap<Element, Cleanup[]>();

function isCinematic(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return document.documentElement.dataset.motion === 'cinematic';
}

function track(el: Element, fn: Cleanup): void {
  const list = cleanups.get(el) ?? [];
  list.push(fn);
  cleanups.set(el, list);
}

/** Tear down all cleanups on a target element. */
export function disposeMotion(el: Element): void {
  const list = cleanups.get(el);
  if (!list) return;
  list.forEach((fn) => {
    try {
      fn();
    } catch {
      /* swallow */
    }
  });
  cleanups.delete(el);
}

/**
 * Apply staggered reveal delays to all `[data-reveal]` children of a container.
 * Index-based ramp, capped at `max` steps so big lists don't drag.
 */
export function registerStaggerReveal(
  container: Element,
  options: { stepMs?: number; max?: number; selector?: string } = {}
): void {
  if (!isCinematic()) return;
  const { stepMs = 80, max = 6, selector = '[data-reveal]' } = options;
  const items = Array.from(container.querySelectorAll<HTMLElement>(selector));
  items.forEach((el, i) => {
    const step = Math.min(i, max);
    el.style.setProperty('--reveal-delay', `${step * stepMs}ms`);
  });
}

/**
 * Bind a parallax translateY effect, driven by scroll. Uses Lenis raf when
 * available; falls back to passive scroll listener.
 */
export function registerParallax(
  el: HTMLElement,
  options: { speed?: number; axis?: 'y' | 'x' } = {}
): void {
  if (!isCinematic()) return;
  const { speed = -0.2, axis = 'y' } = options;

  let raf = 0;
  const update = () => {
    const rect = el.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const offset = (rect.top + rect.height / 2 - viewportCenter) * speed;
    el.style.transform =
      axis === 'y' ? `translate3d(0, ${offset.toFixed(2)}px, 0)` : `translate3d(${offset.toFixed(2)}px, 0, 0)`;
  };

  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  track(el, () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    el.style.transform = '';
  });
}

/**
 * Lazy-load GSAP + ScrollTrigger and pass them to the caller. Resolves to
 * `null` when running under reduced-motion (caller should no-op).
 */
export async function registerScrollTrigger(): Promise<{
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
} | null> {
  if (!isCinematic()) return null;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}
