# PRD: Innovation Ticker

**Status:** Draft
**Owner:** Tsholofelo K. Setati
**Last updated:** 2026-04-29
**Target ship:** Pre-SAICA keynote
**Repo:** `TsholoSetati/TsholoSetati`
**Path scope:** `apps/web/`

---

## 1. Summary

Add a second indicator banner to `tsholosetati.com` — the **Innovation Ticker** — that runs alongside the existing market ticker. Where the market ticker tells a financial-markets story (Yahoo Finance, refreshed by `.github/workflows/fetch-markets.yml`), the Innovation Ticker tells a **technology, policy and capital-flow story biased toward African and frontier-AI signals**.

The ticker reinforces the site's positioning — _innovation economics for African enterprises_ — by surfacing eight rotating indicators that, watched together, communicate a worldview rather than a list of numbers.

This PRD is scoped to ship using the existing stack (Astro 5, Tailwind v4, design tokens, GitHub Actions for data fetch, static JSON in `public/data/`, GitHub Pages deploy) with **no new runtime dependencies and no paid services**.

---

## 2. Why this, why now

The current site has one rail — the financial markets ticker. It signals "this person watches markets." The Innovation Ticker adds a second, sharper signal: "this person watches the intersection of frontier technology, African capital, and AI governance" — which is the actual offer.

Three concrete reasons to ship before the SAICA keynote:

1. **Positioning compression.** Visitors form a position on the site within ~5 seconds. Two complementary rails compress the positioning faster than any hero copy edit could.
2. **Differentiation.** No competing senior-advisor / consulting site in the SA market surfaces submarine cable capacity, AU AI strategy days, or African VC deal flow on a live rail. This is asymmetric.
3. **Editorial reuse.** Several indicators (EU AI Act countdown, AU Strategy days, ratified AI legislation count) link directly to the forthcoming Policy Prism essay and create a consistent frame across the site.

---

## 3. Goals & non-goals

### Goals

- Ship a second ticker that visually pairs with the existing market ticker without competing for attention.
- Surface 8 indicators across 3 categories: **policy & governance**, **African innovation infrastructure**, **frontier compute & capital**.
- Refresh data automatically on schedule via GitHub Actions; produce static JSON consumed at render time.
- Stay on the existing free-only stack — no API keys requiring billing, no paid services.
- Match existing accessibility, reduced-motion, dark-mode, and no-FOUC standards.
- Be feature-flagged so it can be toggled off via `apps/web/src/config/features.ts`.

### Non-goals

- Real-time streaming. Daily refresh is sufficient; some indicators only change weekly or quarterly.
- Personalisation. The ticker is the same for every visitor.
- Click-through interactions. The ticker is read-only on first ship; tooltips on hover are acceptable but not required.
- Replacing the market ticker. Both rails coexist.

---

## 4. Indicator specification

Eight indicators, rotating in the order below. Each indicator is rendered as a single ticker cell with: a short **label**, a **value**, and an optional **delta** (change since last refresh). The full source attribution lives in a tooltip / `aria-label`, not the visible cell.

### 4.1 ZAR / USD exchange rate

| | |
|---|---|
| **Label** | `ZAR/USD` |
| **Value format** | `R18.42` (2 dp) |
| **Delta** | day-over-day pct change, signed |
| **Source** | Yahoo Finance, ticker `ZAR=X` |
| **Refresh** | hourly (extend existing `fetch-markets.yml` schedule) |
| **Implementation** | Add `ZAR=X` to the existing markets fetcher; surface in `innovation.json` rather than `markets.json`, OR re-read the same `markets.json` from the new component. **Recommend the latter to avoid duplicate fetches.** |
| **Failure mode** | If Yahoo returns null, hide cell silently and shorten the rotation. |

### 4.2 Smart Africa membership

| | |
|---|---|
| **Label** | `SMART AFRICA` |
| **Value format** | `38 / 55 AU member states` |
| **Delta** | none (slow-moving) |
| **Source** | [Smart Africa Alliance public list](https://smartafrica.org/who-we-are/) — manually verified |
| **Refresh** | quarterly, manual |
| **Implementation** | Lives in a static TypeScript constant: `apps/web/src/data/innovation-static.ts`. Each entry has a `lastVerified` ISO date; the build fails if any entry is older than 180 days, prompting a refresh. |
| **Failure mode** | Static — no runtime failure path. |
| **Tooltip text** | `Smart Africa Alliance member countries committed to a single digital market. Last verified [date].` |

### 4.3 Submarine cable lit capacity to Africa

| | |
|---|---|
| **Label** | `AFRICA SUBSEA` |
| **Value format** | `~180 Tbps lit capacity` (rounded) |
| **Delta** | year-on-year pct change |
| **Source** | TeleGeography Submarine Cable Map (annual published figure) — manually verified |
| **Refresh** | annual, manual |
| **Implementation** | Static entry in `innovation-static.ts` with `value`, `priorValue`, `asOf` and `source`. |
| **Failure mode** | Static — no runtime failure path. |
| **Note** | Verify the figure each January when TeleGeography publishes its annual update. Year-on-year delta is the interesting signal, not the absolute number. |

### 4.4 Days until EU AI Act high-risk obligations apply

| | |
|---|---|
| **Label** | `EU AI ACT D-DAY` |
| **Value format** | `T-95 days` |
| **Delta** | none (the value _is_ a delta) |
| **Source** | Date math against fixed target `2026-08-02T00:00:00Z` |
| **Refresh** | every page render (computed client-side or at build time) |
| **Implementation** | Pure function `daysUntil(targetISO: string): number` in `apps/web/src/lib/dates.ts`. Computed at render. After the date passes, the indicator switches label to `EU AI ACT IN FORCE` and shows days since (`T+12 days`). |
| **Failure mode** | None. |

### 4.5 Days since AU Continental AI Strategy adoption

| | |
|---|---|
| **Label** | `AU AI STRATEGY` |
| **Value format** | `Day 654 since adoption` |
| **Delta** | none |
| **Source** | Date math against fixed adoption date `2024-07-19` (Executive Council adoption, AU Summit, July 2024) |
| **Refresh** | every page render |
| **Implementation** | Same `daysUntil` / `daysSince` helper as 4.4. |
| **Failure mode** | None. |

### 4.6 Countries with ratified AI legislation

| | |
|---|---|
| **Label** | `RATIFIED AI LAWS` |
| **Value format** | `21 jurisdictions` |
| **Delta** | change vs. prior verified count, e.g. `+3 since Jan` |
| **Source** | OECD AI Policy Observatory + IAPP Global AI Law and Policy Tracker — manually verified |
| **Refresh** | quarterly, manual |
| **Implementation** | Static entry in `innovation-static.ts` with `value`, `priorValue`, `priorAsOf`, `asOf`, `source`. |
| **Failure mode** | Static. |
| **Counting rule** | Count only **enacted, in-force binding instruments** — not draft policies, voluntary frameworks, or executive orders that have been rescinded. Document the counting rule in the data file as a comment so future updates stay consistent. |

### 4.7 Largest AI funding round, last 30 days

| | |
|---|---|
| **Label** | `LARGEST AI ROUND 30D` |
| **Value format** | `Anthropic · $5B Series F` |
| **Delta** | none |
| **Source** | Manually curated from Crunchbase News, The Information, or PitchBook free briefings |
| **Refresh** | weekly, manual (Sunday evening housekeeping commit) |
| **Implementation** | Static entry in `innovation-static.ts` with `company`, `amountUSD`, `roundType`, `announcedDate`, `sourceURL`. The build fails if `announcedDate` is more than 35 days stale. |
| **Failure mode** | Static. |
| **Note** | This is the indicator most likely to look stale. The build-time staleness check is the forcing function. Keep a calendar reminder for Sunday update. |

### 4.8 AI ETF performance

| | |
|---|---|
| **Label** | `AI ETF (BOTZ)` |
| **Value format** | `$38.42 +1.2%` |
| **Delta** | day-over-day pct change |
| **Source** | Yahoo Finance, ticker `BOTZ` (alternative: `AIQ`, `ROBO` — pick one and document the choice) |
| **Refresh** | hourly via existing markets fetcher |
| **Implementation** | Add `BOTZ` to the existing tickers list in `fetch-markets.yml`. |
| **Failure mode** | If Yahoo returns null, hide cell silently. |

#### Africa-focused VC deal count (deferred)

The original brief included an Africa-focused VC deal count. Briter Bridges and Partech publish quarterly, not weekly, and there is no free programmatic source. **Recommend deferring to v2** rather than shipping a stale number. If you want it in v1, add it as a static quarterly entry in `innovation-static.ts` with the most recent published Briter or Partech figure and a `Q1 2026` style as-of label.

---

## 5. Data architecture

### 5.1 Two data files, one component

```
apps/web/
  public/data/
    markets.json            # existing — Yahoo Finance live
    innovation.json         # NEW — outputs of fetch-innovation.yml (Yahoo + computed dates)
  src/
    data/
      innovation-static.ts  # NEW — manually maintained entries (4.2, 4.3, 4.6, 4.7)
    components/
      InnovationTicker.astro  # NEW — reads both sources, composes the rail
    lib/
      dates.ts              # NEW — daysUntil / daysSince helpers
```

The component composes its display from three sources: live Yahoo data (`markets.json`), computed dates (`dates.ts`), and curated entries (`innovation-static.ts`). It does **not** make network calls at render time.

### 5.2 GitHub Action: `fetch-innovation.yml`

A new Action, modelled on the existing `fetch-markets.yml`. It runs hourly, but in practice the only dynamic items it pulls are already in the markets fetch — so the simplest design is:

**Option A (recommended):** Do not add a new Action. Extend `fetch-markets.yml` to include `ZAR=X` and `BOTZ` in its ticker list. The existing JSON output covers everything. The Innovation Ticker component reads the same `markets.json` and references specific tickers by symbol.

**Option B:** Add `fetch-innovation.yml` only if you later want indicators that need additional fetching (e.g., a Hugging Face model count, an arXiv submissions count) that don't fit the markets fetcher's shape.

Ship Option A in v1. Document Option B in this file under §9 for the v2 backlog.

### 5.3 `innovation-static.ts` schema

```ts
// apps/web/src/data/innovation-static.ts

export type StaticIndicator = {
  id: string;
  label: string;
  value: string;
  priorValue?: string;
  delta?: string;          // pre-formatted, e.g. "+3 since Jan"
  asOf: string;            // ISO date
  priorAsOf?: string;
  source: string;          // human-readable attribution
  sourceURL: string;
  staleAfterDays: number;  // build fails if exceeded
};

export const staticIndicators: StaticIndicator[] = [
  {
    id: 'smart-africa',
    label: 'SMART AFRICA',
    value: '38 / 55 AU member states',
    asOf: '2026-04-15',
    source: 'Smart Africa Alliance',
    sourceURL: 'https://smartafrica.org/who-we-are/',
    staleAfterDays: 180,
  },
  // ... etc
];
```

A build-time check in `astro.config.mjs` (or a pre-build script) iterates the array and throws if any entry is staler than its `staleAfterDays` window. This makes "ship stale data" structurally hard rather than relying on memory.

---

## 6. Component & visual design

### 6.1 Placement

The Innovation Ticker sits **directly below the existing market ticker** in `BaseLayout.astro`, separated by a hairline rule using the existing border token. Both rails use the same height, the same monospace font (existing token), and the same scroll speed.

### 6.2 Visual differentiation

The market ticker uses the existing accent for positive / negative deltas. The Innovation Ticker uses **a single neutral hue** (the existing `--color-accent` brown / warm tone) with no red/green semantics. Rationale: most innovation indicators don't have a clear "good / bad" valence — `+3 ratified AI laws` is neutral information, not market sentiment.

A small left-edge label, vertical and rotated, reads `INNOVATION` in the existing eyebrow style — analogous to the implicit `MARKETS` framing on the existing rail.

### 6.3 Cell anatomy

```
┌──────────────────────────────────────────────────────────────┐
│  [LABEL]    [VALUE]    [DELTA?]                              │
│  EU AI ACT D-DAY    T-95 DAYS                                │
└──────────────────────────────────────────────────────────────┘
```

`LABEL` is uppercase, monospace, letter-spacing `0.18em`, opacity 0.65.
`VALUE` is the foreground: regular weight, full opacity.
`DELTA` is optional, monospace, opacity 0.85.

### 6.4 Accessibility

- Each cell has an `aria-label` containing the full long-form: `"EU AI Act high-risk obligations apply in 95 days. Source: Regulation (EU) 2024/1689."`
- The whole rail respects `prefers-reduced-motion: reduce` — animation pauses; cells become a static grid that wraps. (Existing market ticker should already do this; mirror the implementation.)
- The rail is `role="region" aria-label="Innovation indicators"` and is reachable via skip-link.
- Colour contrast meets WCAG AA against the page background in both light and dark themes (use existing tokens).

### 6.5 Dark mode

No new tokens. The component uses existing `--color-fg`, `--color-fg-muted`, `--color-border`, `--color-accent` tokens and inherits the no-FOUC behaviour of the existing layout.

---

## 7. Configuration & feature flag

Add to `apps/web/src/config/features.ts`:

```ts
export const features = {
  // ...existing
  innovationTicker: true,  // NEW — kill switch for the second rail
};
```

`BaseLayout.astro` conditionally renders the component. Default `true` in v1 once shipped; flip to `false` to hide instantly without redeploying templates.

---

## 8. Acceptance criteria

A reviewer (or Copilot) should be able to verify each of these against the running site at `localhost:4321` and the deployed site after merge:

- [ ] Eight indicators render in the order specified in §4, rotating left-to-right.
- [ ] `markets.json` includes `ZAR=X` and `BOTZ` and the rail reads them correctly.
- [ ] `innovation-static.ts` exists with at least the four manual indicators (4.2, 4.3, 4.6, 4.7) populated and `asOf` dated within the past 30 days at ship.
- [ ] `dates.ts` exposes `daysUntil` and `daysSince` and is unit-testable. (Add a `*.test.ts` if a test runner is set up; otherwise document expected behaviour in JSDoc.)
- [ ] EU AI Act indicator computes `T-N days` and switches to `T+N` after the target date.
- [ ] AU Strategy indicator computes `Day N` since `2024-07-19`.
- [ ] Build fails if any `innovation-static.ts` entry is older than its `staleAfterDays` window.
- [ ] Build fails if `largest-ai-round` `announcedDate` is older than 35 days.
- [ ] Component respects `prefers-reduced-motion` (animation pauses, content becomes static).
- [ ] Component renders correctly in both light and dark mode without FOUC.
- [ ] `features.innovationTicker = false` removes the rail with no console errors.
- [ ] Lighthouse: no regression in performance, accessibility, or best-practices scores vs. main.
- [ ] No new runtime npm dependencies introduced (build-time helpers like `dayjs` are acceptable; avoid `axios`, `node-fetch` etc.).

---

## 9. Backlog (v2 and beyond)

Items intentionally out of scope for v1:

- **Hugging Face model count** — needs a new GitHub Action (Option B in §5.2) to fetch from the HF API. Adds a frontier-research signal but feels less differentiated than the African indicators.
- **arXiv cs.AI weekly submission count** — same architecture as HF.
- **Africa VC deal count from Briter / Partech** — requires programmatic access or a stable manual cadence; defer until a clean source emerges.
- **Click-through interactions** — each cell could expand to a brief explainer panel inline. Useful but adds JS weight; defer.
- **i18n** — no Setswana / French / Arabic surface in v1. The ticker is short enough that a future i18n pass is mechanical.
- **Sound-on-update easter egg** — out of scope and probably forever a bad idea.

---

## 10. Risks & mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Static indicators go stale and embarrass the brand | High | Build-time staleness check (§5.3) makes a stale ship structurally impossible. |
| Yahoo Finance changes its endpoint or rate-limits | Medium | Already a risk for the existing markets ticker; same mitigation (graceful hide, hourly cache) applies. |
| Visual clutter — two rails feels heavy | Medium | Hairline separator, neutral colour for innovation row, identical motion speed. Test at 1280px and at 380px before merging. |
| Subjective judgement of which indicators "matter" gets criticised | Low | Source and methodology in tooltips and `aria-label`. The rail is editorial, not encyclopedic — that's fine and intentional. |
| Counting rule for "ratified AI laws" is contested | Medium | Document the counting rule in `innovation-static.ts` as a comment; cite OECD + IAPP as the canonical references. |

---

## 11. Open questions

1. Should the rail pause on hover? (Existing market ticker behaviour: confirm and mirror.)
2. Should the rail link to a single explainer page (e.g., `/innovation-rail`) describing each indicator's source? Recommend yes, but defer to v2 — keep v1 about getting the rail itself right.
3. Should the `Africa-focused VC deal count` ship as a quarterly static entry in v1 or wait for a programmatic source?

---

## 12. Implementation hints for Copilot

When implementing this PRD, prefer:

- **Astro components over React islands** for the ticker shell. Use a React island only if a specific cell ever needs interactivity (none do in v1).
- **Existing design tokens in `apps/web/src/styles/tokens.css`** — do not introduce new colour values inline.
- **The same scrolling animation primitive as the market ticker** — find it under `apps/web/src/components/` (likely a `Ticker.astro` or `MarketTicker.astro`) and either parameterise it or extract a shared `TickerRail.astro`.
- **Pure functions in `lib/dates.ts`** — no side effects, no globals, easy to verify.
- **Tooltips via `title` attribute and `aria-label` only** in v1 — no JS-driven popover library.
- **No new npm packages** unless absolutely necessary; if a date helper is needed and `Intl` plus native `Date` aren't enough, justify the choice in the PR description.

When in doubt, mirror the patterns already in `apps/web/src/components/` and `apps/web/src/data/`. The repo's existing conventions are the source of truth — this PRD describes what to build, not how to override.
