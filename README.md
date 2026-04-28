# tsholosetati.com

Personal site of **Tsholofelo K. Setati** — AI Strategy & Innovation Economics consultant.
Live at [tsholosetati.com](https://tsholosetati.com).

## Stack

The current site (v2.0) is an [Astro](https://astro.build) application living in [`apps/web`](apps/web/).

| Concern         | Choice                                                  |
| --------------- | ------------------------------------------------------- |
| Framework       | Astro 5 (static output)                                 |
| Styling         | Tailwind v4 + design tokens                             |
| Content         | Markdown / MDX via Astro Content Collections            |
| Search          | Pagefind (build-time keyword index)                     |
| Motion          | Lenis smooth scroll + IntersectionObserver reveals      |
| Forms           | Formspree (no server)                                   |
| Hosting         | GitHub Pages, deployed via `.github/workflows/deploy.yml` |
| Market data     | Yahoo Finance v8 (no key) → static JSON, refreshed on a schedule |

The previous static HTML/JS site is preserved under [`legacy/`](legacy/) for reference.

## Local development

```powershell
cd apps/web
npm install
npm run dev
```

Then open <http://localhost:4321>.

## Build

```powershell
cd apps/web
npm run build
```

Output is written to `apps/web/dist/`.

## Project layout

```
apps/web/
  src/
    components/   # Astro components (header, footer, ticker, ...)
    config/       # site + feature flags
    content/      # MDX insights collection
    data/         # static data (experience, demos, capabilities, diagnostic rubric)
    layouts/      # BaseLayout
    lib/          # motion, theme init, SEO helpers
    pages/        # routes
    styles/       # tokens.css + global.css
  public/         # static assets, demo subprojects
.github/workflows/
  deploy.yml         # build apps/web and deploy to GH Pages
  fetch-markets.yml  # refresh public/data/markets.json from Yahoo Finance
  fetch-stocks.yml   # legacy Alpha Vantage fetcher (manual only)
  ci.yml             # link / build checks
legacy/            # the previous static site, preserved
```

## Configuration

Toggles live in [`apps/web/src/config/features.ts`](apps/web/src/config/features.ts):

- `formspreeId` — drop in your Formspree form ID to enable the contact form.
- `plausibleDomain` — set to enable Plausible analytics.
- Individual feature kill-switches (`marketTicker`, `aiDiagnostic`, ...).

## Notes on AI

How AI is (and is not) used on this site is documented at [/ai](https://tsholosetati.com/ai)
and in [`apps/web/src/pages/ai.astro`](apps/web/src/pages/ai.astro).

## What changed in v2.0

- Migrated from a hand-rolled multi-page HTML/JS site to Astro.
- Editorial / cinematic visual system on top of a token-driven design system, with no-FOUC dark mode.
- New Insights collection (MDX) with topic filtering, RSS, sitemap, and structured data.
- Demos hub with a chrome-wrapped iframe shell; existing prototypes (PayPer, Sharp-Sharp, Financial Planning, ID8, GiftlyInvited) live under `apps/web/public/demos/`.
- New AI Maturity Diagnostic — a deterministic, in-browser rubric across six dimensions (no LLM, no telemetry).
- Live market ticker fed by a free, keyless Yahoo Finance endpoint, refreshed on schedule by GitHub Actions.
- Contact form via Formspree (no backend), with honeypot + timestamp spam mitigation.
- Per-page JSON-LD (Person, WebSite, Article, BreadcrumbList) and OG metadata.
- Full keyboard, focus and reduced-motion support.

For a complete plan / decision log, see internal session notes.
