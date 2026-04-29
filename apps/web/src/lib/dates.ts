/**
 * Pure date helpers for Innovation Economics indicators.
 * No deps. Returns whole-day counts in UTC to avoid TZ drift in static builds.
 */

/** Whole UTC days from now until target. Negative if target has passed. */
export function daysUntil(targetISO: string, now: Date = new Date()): number {
  const target = new Date(targetISO).getTime();
  const ms = target - now.getTime();
  return Math.ceil(ms / 86_400_000);
}

/** Whole UTC days since target. Negative if target is in the future. */
export function daysSince(targetISO: string, now: Date = new Date()): number {
  const target = new Date(targetISO).getTime();
  const ms = now.getTime() - target;
  return Math.floor(ms / 86_400_000);
}

/** Format `T-N days` / `T+N days` for countdown indicators. */
export function formatCountdown(targetISO: string, now: Date = new Date()): string {
  const d = daysUntil(targetISO, now);
  if (d > 0) return `T-${d} days`;
  if (d < 0) return `T+${Math.abs(d)} days`;
  return 'T-0 today';
}
