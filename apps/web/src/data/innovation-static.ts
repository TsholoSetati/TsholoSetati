/**
 * Manually maintained Innovation Economics indicators.
 * Build fails if any entry's `asOf` is older than `staleAfterDays`.
 */

export type StaticIndicator = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  asOf: string;            // ISO date
  source: string;
  sourceURL: string;
  staleAfterDays: number;
  tooltip: string;
};

export const staticIndicators: StaticIndicator[] = [
  {
    id: 'africa-subsea',
    label: 'AFRICA SUBSEA',
    value: '180 Tbps',
    delta: '+21% YoY',
    asOf: '2026-01-15',
    source: 'TeleGeography Submarine Cable Map',
    sourceURL: 'https://www.submarinecablemap.com/',
    staleAfterDays: 400, // annual figure, refresh every Jan
    tooltip: 'Lit international bandwidth on subsea cables landing in Africa. Year-on-year growth signals frontier infrastructure capacity for AI workloads.',
  },
];

/** Throws at build time if any indicator is past its freshness window. */
export function assertFreshness(indicators: StaticIndicator[] = staticIndicators, now = new Date()): void {
  const stale: string[] = [];
  for (const ind of indicators) {
    const ageDays = Math.floor((now.getTime() - new Date(ind.asOf).getTime()) / 86_400_000);
    if (ageDays > ind.staleAfterDays) {
      stale.push(`${ind.id} (asOf ${ind.asOf}, ${ageDays}d old, max ${ind.staleAfterDays}d)`);
    }
  }
  if (stale.length > 0) {
    throw new Error(
      `Innovation Economics indicators are stale and must be refreshed:\n  - ${stale.join('\n  - ')}\n\nUpdate apps/web/src/data/innovation-static.ts`
    );
  }
}
