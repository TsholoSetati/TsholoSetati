export interface Demo {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  iframe: string;
  height: number;
  category: 'Fintech' | 'Productivity' | 'AI Tooling' | 'Personal Finance';
  status: 'Live demo' | 'Prototype';
  /** Brand narrative: what this demo demonstrates about how I think and build. */
  narrative?: {
    /** One-line claim shown at the top of the panel. */
    claim: string;
    /** 2–4 capability bullets. Plain strings; no markdown. */
    capabilities: string[];
    /** Tech / methods used. Short tag-like strings. */
    stack: string[];
  };
  /** Disable iframe sandbox loosening for demos that don't need forms/popups. */
  sandbox?: 'strict' | 'standard';
}

export const demos: Demo[] = [
  {
    slug: 'sharp-sharp',
    title: 'Sharp-Sharp',
    tagline: 'Shared expense tracker',
    description:
      'Split bills, track expenses, and settle up with friends. A SPA prototype exploring offline-first ledgers and friction-light settlement flows.',
    iframe: '/demos/sharp-sharp/demo.html',
    height: 900,
    category: 'Personal Finance',
    status: 'Live demo',
    narrative: {
      claim: 'Reducing the friction between owing and settling.',
      capabilities: [
        'Add expenses, split by share or by head, and see who owes whom in one glance.',
        'Local-first ledger that survives a refresh — no sign-up to try it.',
        'Settlement suggestions that minimise the number of payments needed.',
      ],
      stack: ['Vanilla JS', 'localStorage', 'Offline-first UX'],
    },
  },
  {
    slug: 'payper',
    title: 'PayPer',
    tagline: 'Negotiation & payment platform',
    description:
      'Fintech prototype for managing payments and negotiation workflows. Demonstrates a structured back-and-forth between counterparties before settlement.',
    iframe: '/demos/payper/demo.html',
    height: 1000,
    category: 'Fintech',
    status: 'Prototype',
    narrative: {
      claim: 'Bringing structure to the messy moment between offer and payment.',
      capabilities: [
        'Counter-offer state machine: request → counter → accept → settle, fully traceable.',
        'Trust-score gauge that updates as the negotiation progresses.',
        'Phone-frame UI demonstrating an end-user view of a complex backend flow.',
      ],
      stack: ['Vanilla JS', 'SVG animation', 'State machines'],
    },
  },
  {
    slug: 'financial-planning',
    title: 'Financial Planning',
    tagline: 'South African personal finance toolkit',
    description:
      'SA-localised calculators for tax (SARS 2024/25), retirement with Monte Carlo, two-pot withdrawals, goal planning, and loan amortisation. Built for decisions you actually have to make.',
    iframe: '/demos/financial-planning/demo.html',
    height: 1100,
    category: 'Personal Finance',
    status: 'Live demo',
    narrative: {
      claim: 'Personal finance should be quantitative, local, and honest about uncertainty.',
      capabilities: [
        'Six calculators built on real SARS tables, not US heuristics: brackets, RA s.11F shield, two-pot taxation.',
        '1 000-path Monte Carlo retirement projection with seeded results — same inputs always give the same answer.',
        'Vehicle-aware goal planning that compares TFSA vs RA vs discretionary on after-tax outcome.',
      ],
      stack: ['Vanilla JS', 'Inline-SVG fan charts', 'Mulberry32 PRNG', 'Box–Muller'],
    },
  },
  {
    slug: 'id8',
    title: 'ID8',
    tagline: 'AI use-case assessment tool',
    description:
      'A framework for identifying, scoring, and prioritising AI opportunities. Inputs a portfolio of ideas; outputs a value-weighted shortlist.',
    iframe: '/demos/id8/demo.html',
    height: 1000,
    category: 'AI Tooling',
    status: 'Live demo',
    narrative: {
      claim: 'Turning the "should we build this with AI?" debate into a defensible decision.',
      capabilities: [
        'Seven weighted criteria across Value and Feasibility axes — mirrors how I run portfolio reviews.',
        '2×2 matrix with bubble-sized financial impact and tier badges (Kill / Defer / Pilot / Scale / Flagship).',
        'Pre-authored insurance-sector portfolio so you can stress-test the model immediately.',
        'Shareable URL state (base64-encoded) so analysis travels with the link.',
      ],
      stack: ['Vanilla JS', 'Inline SVG matrix', 'Deterministic scoring', 'CSV export'],
    },
  },
  {
    slug: 'giftly',
    title: 'GiftlyInvited',
    tagline: 'Private gift registry',
    description:
      'Invite-only gift registry with admin and guest experiences. Client-side only — all state is held in your browser.',
    iframe: '/demos/giftly/demo.html',
    height: 1100,
    category: 'Productivity',
    status: 'Prototype',
    narrative: {
      claim: 'A private, invite-gated registry without the surveillance baggage of the big platforms.',
      capabilities: [
        'Admin / guest split-view that reflects how a real registry has to work.',
        'Item claims, group chip-ins, RSVP and .ics calendar export.',
        'No accounts, no tracking — everything lives in your browser.',
      ],
      stack: ['Vanilla JS', 'Local state', 'Privacy-first'],
    },
  },
];

export const getDemo = (slug: string) => demos.find((d) => d.slug === slug);
