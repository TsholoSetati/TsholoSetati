/**
 * Site-wide configuration constants.
 * Single source of truth for branding, navigation, social, SEO defaults.
 */

export const site = {
  name: 'Tsholofelo K. Setati',
  shortName: 'TS',
  url: 'https://tsholosetati.com',
  title: 'Tsholofelo K. Setati, AI, Technology Economics & Governance',
  description:
    'Tsholofelo K. Setati works at the intersection of AI, technology economics and institutional governance, writing, advising and thinking in public across enterprise, government, multilateral and non-profit contexts.',
  tagline: 'AI. Technology Economics. Governance. Strategy.',
  locale: 'en-ZA',
  themeColor: '#0a0e1a',
  author: {
    name: 'Tsholofelo K. Setati',
    role: 'AI, Technology Economics & Governance',
    email: 'hello@tsholosetati.com',
    location: 'Johannesburg, South Africa',
  },
  social: {
    linkedin: 'https://www.linkedin.com/in/tsholosetati',
    github: 'https://github.com/tsholosetati',
    x: 'https://x.com/tsholosetati',
  },
} as const;

export const nav = [
  { label: 'About', href: '/about' },
  { label: 'Experience', href: '/experience' },
  { label: 'Expertise', href: '/expertise' },
  { label: 'Insights', href: '/insights' },
  { label: 'Tech + Policy', href: '/policy' },
  { label: 'Economics', href: '/economics' },
  { label: 'Demos', href: '/demos' },
  { label: 'Contact', href: '/contact' },
] as const;

export const footerLinks = {
  Site: [
    { label: 'About', href: '/about' },
    { label: 'Experience', href: '/experience' },
    { label: 'Expertise', href: '/expertise' },
    { label: 'Contact', href: '/contact' },
  ],
  Work: [
    { label: 'Insights', href: '/insights' },
    { label: 'Tech + Policy', href: '/policy' },
    { label: 'Economics', href: '/economics' },
    { label: 'Demos', href: '/demos' },
    { label: 'AI Diagnostic', href: '/demos/diagnostic' },
    { label: 'How AI is used here', href: '/ai' },
  ],
  Connect: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tsholosetati' },
    { label: 'Email', href: 'mailto:hello@tsholosetati.com' },
    { label: 'RSS', href: '/rss.xml' },
  ],
} as const;
