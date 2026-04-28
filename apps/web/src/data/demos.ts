export interface Demo {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  iframe: string;
  height: number;
  category: 'Fintech' | 'Productivity' | 'AI Tooling' | 'Personal Finance';
  status: 'Live demo' | 'Prototype';
}

export const demos: Demo[] = [
  {
    slug: 'sharp-sharp',
    title: 'Sharp-Sharp',
    tagline: 'Shared expense tracker',
    description:
      'Split bills, track expenses, and settle up with friends. A SPA prototype exploring offline-first ledgers and friction-light settlement flows.',
    iframe: '/demos/sharp-sharp/',
    height: 900,
    category: 'Personal Finance',
    status: 'Live demo',
  },
  {
    slug: 'payper',
    title: 'PayPer',
    tagline: 'Negotiation & payment platform',
    description:
      'Fintech prototype for managing payments and negotiation workflows. Demonstrates a structured back-and-forth between counterparties before settlement.',
    iframe: '/demos/payper/',
    height: 1000,
    category: 'Fintech',
    status: 'Prototype',
  },
  {
    slug: 'financial-planning',
    title: 'Financial Planning',
    tagline: 'Smart advisor & retirement calculators',
    description:
      'Personal financial planning toolkit — retirement projections, savings goals, and scenario modelling. Built to make long-horizon decisions tractable.',
    iframe: '/demos/financial-planning/',
    height: 1000,
    category: 'Personal Finance',
    status: 'Live demo',
  },
  {
    slug: 'id8',
    title: 'ID8',
    tagline: 'AI use-case assessment tool',
    description:
      'A framework for identifying, scoring, and prioritising AI opportunities. Inputs a portfolio of ideas; outputs a value-weighted shortlist.',
    iframe: '/demos/id8/',
    height: 1000,
    category: 'AI Tooling',
    status: 'Live demo',
  },
  {
    slug: 'giftly',
    title: 'GiftlyInvited',
    tagline: 'Private gift registry',
    description:
      'Invite-only gift registry with admin and guest experiences. Client-side only — all state is held in your browser.',
    iframe: '/demos/giftly/',
    height: 1100,
    category: 'Productivity',
    status: 'Prototype',
  },
];

export const getDemo = (slug: string) => demos.find((d) => d.slug === slug);
